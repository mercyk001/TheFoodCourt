from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Table, Reservation
from datetime import datetime

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

@tables_bp.route('/available', methods=['GET'])
def get_available_tables():
    date = request.args.get('date')
    time = request.args.get('time')
    
    try:
        requested_time = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    except ValueError:
        return jsonify({"error": "Invalid date/time format. Use YYYY-MM-DD and HH:MM"}), 400