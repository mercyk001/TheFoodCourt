from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Table, Reservation
from datetime import datetime, timedelta

tables_bp = Blueprint('tables', __name__, url_prefix='/tables')

@tables_bp.route('/', methods=['GET'])
def get_tables():
    tables = Table.query.all()
    return jsonify([table.to_dict() for table in tables]), 200

@tables_bp.route('/<int:id>', methods=['GET'])
def get_table(id):
    table = Table.query.get(id)
    if not table:
        return jsonify({"error": "Table not found"}), 404
    return jsonify(table.to_dict()), 200

@tables_bp.route('/', methods=['POST'])
@jwt_required()
def create_table():
    data = request.get_json()
    
    try:
        new_table = Table(
            table_number=data['table_number'],
            capacity=data['capacity'],
            status=data.get('status', 'available')
        )
        db.session.add(new_table)
        db.session.commit()
        return jsonify(new_table.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    
@tables_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def update_table(id):
    table = Table.query.get(id)
    if not table:
        return jsonify({"error": "Table not found"}), 404

    data = request.get_json()
    try:
        table.status = data.get('status', table.status)
        db.session.commit()
        return jsonify(table.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    
@tables_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_table(id):
    table = Table.query.get(id)
    if not table:
        return jsonify({"error": "Table not found"}), 404
        
    db.session.delete(table)
    db.session.commit()
    return jsonify({"message": "Table deleted successfully"}), 200

def generate_time_slots():
    """Generate all available time slots for a day (10 AM to 10 PM, 30-minute intervals)"""
    slots = []
    for hour in range(10, 22):  # 10 AM to 9:30 PM
        for minute in [0, 30]:
            time_str = f"{hour:02d}:{minute:02d}"
            slots.append(time_str)
    return slots

def is_table_available_at_time(table_id, date, time_slot, duration=120):
    """Check if a table is available at a specific time slot"""
    try:
        requested_datetime = datetime.strptime(f"{date} {time_slot}", "%Y-%m-%d %H:%M")
        end_datetime = requested_datetime + timedelta(minutes=duration)
        
        # Get all confirmed reservations for this table on this date
        existing_reservations = Reservation.query.filter(
            Reservation.table_id == table_id,
            Reservation.status.in_(['confirmed', 'pending']),
            db.func.date(Reservation.reservation_time) == date
        ).all()
        
        # Check for conflicts
        for reservation in existing_reservations:
            reservation_end = reservation.reservation_time + timedelta(minutes=reservation.duration)
            
            # Check if there's any overlap
            if (requested_datetime < reservation_end and end_datetime > reservation.reservation_time):
                return False
                
        return True
    except Exception as e:
        print(f"Error checking availability: {e}")
        return False

@tables_bp.route('/available', methods=['GET'])
def get_available_tables():
    date = request.args.get('date')
    time = request.args.get('time')
    guests = request.args.get('guests', type=int)
    
    if not date:
        return jsonify({"error": "Date parameter is required"}), 400
    
    try:
        # Validate date format
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    # Get all available tables
    all_tables = Table.query.filter(Table.status == 'available').all()
    
    # Filter by capacity if guests parameter is provided
    if guests:
        suitable_tables = [table for table in all_tables if table.capacity >= guests]
    else:
        suitable_tables = all_tables
    
    # If specific time is provided, check availability for that time
    if time:
        try:
            datetime.strptime(time, "%H:%M")
        except ValueError:
            return jsonify({"error": "Invalid time format. Use HH:MM"}), 400
            
        available_tables = []
        for table in suitable_tables:
            if is_table_available_at_time(table.id, date, time):
                table_dict = table.to_dict()
                table_dict['available_at_requested_time'] = True
                available_tables.append(table_dict)
        
        return jsonify(available_tables), 200
    
    # If no specific time, return tables with their available time slots
    tables_with_slots = []
    time_slots = generate_time_slots()
    
    for table in suitable_tables:
        available_slots = []
        for slot in time_slots:
            if is_table_available_at_time(table.id, date, slot):
                available_slots.append(slot)
        
        table_dict = table.to_dict()
        table_dict['available_time_slots'] = available_slots
        table_dict['total_available_slots'] = len(available_slots)
        tables_with_slots.append(table_dict)
    
    # Sort by capacity and then by number of available slots
    tables_with_slots.sort(key=lambda x: (x['capacity'], -x['total_available_slots']))
    
    return jsonify(tables_with_slots), 200

@tables_bp.route('/availability-summary', methods=['GET'])
def get_availability_summary():
    """Get a summary of table availability by capacity for a specific date"""
    date = request.args.get('date')
    
    if not date:
        return jsonify({"error": "Date parameter is required"}), 400
    
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    # Group tables by capacity
    capacity_groups = {}
    all_tables = Table.query.filter(Table.status == 'available').all()
    
    for table in all_tables:
        capacity = table.capacity
        if capacity not in capacity_groups:
            capacity_groups[capacity] = {
                'capacity': capacity,
                'total_tables': 0,
                'available_tables': 0,
                'tables': []
            }
        
        capacity_groups[capacity]['total_tables'] += 1
        
        # Check if table has any availability during the day
        time_slots = generate_time_slots()
        available_slots = sum(1 for slot in time_slots if is_table_available_at_time(table.id, date, slot))
        
        if available_slots > 0:
            capacity_groups[capacity]['available_tables'] += 1
            table_dict = table.to_dict()
            table_dict['available_slots_count'] = available_slots
            capacity_groups[capacity]['tables'].append(table_dict)
    
    # Convert to list and sort by capacity
    summary = list(capacity_groups.values())
    summary.sort(key=lambda x: x['capacity'])
    
    return jsonify({
        'date': date,
        'capacity_groups': summary,
        'total_tables': len(all_tables),
        'total_available': sum(group['available_tables'] for group in summary)
    }), 200