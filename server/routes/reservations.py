from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_
from models import db, Reservation, Table
from datetime import datetime, timedelta

reservations_bp = Blueprint('reservations', __name__, url_prefix='/reservations')

# GET /reservations/my - Get customer's own reservations
@reservations_bp.route('/my', methods=['GET'])
@jwt_required()
def get_customer_reservations():
    identity = get_jwt_identity()
    if identity['role'] != 'customer':
        return jsonify({'error': 'Only customers can view their reservations'}), 403

    customer_id = identity['id']
    
    try:
        reservations = Reservation.query.filter_by(customer_id=customer_id).order_by(Reservation.reservation_time.desc()).all()
        
        reservations_data = []
        for reservation in reservations:
            # Get table info
            table = Table.query.get(reservation.table_id)
            
            reservations_data.append({
                "id": reservation.id,
                "table_id": reservation.table_id,
                "table_number": table.table_number if table else "Unknown",
                "table_capacity": table.capacity if table else 0,
                "reservation_time": reservation.reservation_time.isoformat() if reservation.reservation_time else None,
                "duration": reservation.duration,
                "members_count": reservation.members_count,
                "status": reservation.status,
                "created_at": reservation.created_at.isoformat() if hasattr(reservation, 'created_at') and reservation.created_at else None
            })
        
        return jsonify({"data": reservations_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST /reservations - Book a table

@reservations_bp.route('', methods=['POST'])
@jwt_required()
def create_reservation():
    identity = get_jwt_identity()
    if identity['role'] != 'customer':
        return jsonify({'error': 'Only customers can make reservations'}), 403

    data = request.get_json()
    customer_id = identity['id']
    table_id = data['table_id']
    duration = int(data['duration'])

    try:
        reservation_time = datetime.fromisoformat(data.get('reservation_time', datetime.utcnow().isoformat()))
        end_time = reservation_time + timedelta(minutes=duration)

        existing_reservations = Reservation.query.filter(
            Reservation.table_id == table_id,
            Reservation.status.notin_(['cancelled', 'free'])
        ).all()

        for r in existing_reservations:
            r_end = r.reservation_time + timedelta(minutes=r.duration)
            if r.reservation_time < end_time and r_end > reservation_time:
                return jsonify({'error': 'This table is already reserved at that time.'}), 409

        reservation = Reservation(
            customer_id=customer_id,
            table_id=table_id,
            reservation_time=reservation_time,
            duration=duration,
            members_count=data['members_count'],
            status=data.get('status', 'pending')
        )
        db.session.add(reservation)
        db.session.commit()

        return jsonify(reservation.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# GET /reservations - Public

@reservations_bp.route('', methods=['GET'])
def get_reservations():
    reservations = Reservation.query.all()
    return jsonify([r.to_dict() for r in reservations]), 200


# GET /reservations/<id> - Public

@reservations_bp.route('/<int:id>', methods=['GET'])
def get_reservation(id):
    reservation = Reservation.query.get(id)
    if reservation:
        return jsonify(reservation.to_dict()), 200
    return jsonify({'error': 'Reservation not found'}), 404


# PUT /reservations/<id> - Update (JWT Protected for customer)

@reservations_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_reservation(id):
    identity = get_jwt_identity()
    if identity['role'] != 'customer':
        return jsonify({'error': 'Only customers can update reservations'}), 403

    reservation = Reservation.query.get(id)
    if not reservation or reservation.customer_id != identity['id']:
        return jsonify({'error': 'Reservation not found or unauthorized'}), 404

    data = request.get_json()

    try:
        # Only update provided fields
        if 'reservation_time' in data:
            reservation.reservation_time = datetime.fromisoformat(data['reservation_time'])
        if 'duration' in data:
            reservation.duration = int(data['duration'])
        if 'members_count' in data:
            reservation.members_count = data['members_count']
        if 'status' in data:
            reservation.status = data['status']

        db.session.commit()
        return jsonify(reservation.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# PATCH /reservations/<id>/status - Update reservation status (JWT Protected for owners)
@reservations_bp.route('/<int:id>/status', methods=['PATCH'])
@jwt_required()
def update_reservation_status(id):
    identity = get_jwt_identity()
    if identity['role'] != 'owner':
        return jsonify({'error': 'Only restaurant owners can update reservation status'}), 403

    reservation = Reservation.query.get(id)
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404

    data = request.get_json()
    new_status = data.get('status')
    
    # Only allow confirmed and rejected statuses for owners
    if new_status not in ['confirmed', 'rejected']:
        return jsonify({'error': 'Status can only be "confirmed" or "rejected"'}), 400

    try:
        reservation.status = new_status
        db.session.commit()
        return jsonify(reservation.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
