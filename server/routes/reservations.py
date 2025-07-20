from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_
from models import db, Reservation, Table
from datetime import datetime, timedelta

reservations_bp = Blueprint('reservations', __name__, url_prefix='/reservations')

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
    duration = data['duration']

    try:
        reservation_time = datetime.fromisoformat(data.get('reservation_time', datetime.utcnow().isoformat()))
        end_time = reservation_time + timedelta(minutes=duration)

        # Check for overlapping reservation
        overlapping = Reservation.query.filter(
            Reservation.table_id == table_id,
            Reservation.status != 'cancelled',
            and_(
                Reservation.reservation_time < end_time,
                (Reservation.reservation_time + timedelta(minutes=Reservation.duration)) > reservation_time
            )
        ).first()

        if overlapping:
            return jsonify({'error': 'This table is already reserved at that time.'}), 409

        # Save the reservation
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

# PUT /reservations/<id> - Update by the owner 
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
        reservation.reservation_time = datetime.fromisoformat(data.get('reservation_time', reservation.reservation_time.isoformat()))
        reservation.duration = data.get('duration', reservation.duration)
        reservation.members_count = data.get('members_count', reservation.members_count)
        reservation.status = data.get('status', reservation.status)

        db.session.commit()
        return jsonify(reservation.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# DELETE /reservations/<id> - Cancel by owner 
@reservations_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_reservation(id):
    identity = get_jwt_identity()
    if identity['role'] != 'customer':
        return jsonify({'error': 'Only customers can delete reservations'}), 403

    reservation = Reservation.query.get(id)
    if not reservation or reservation.customer_id != identity['id']:
        return jsonify({'error': 'Reservation not found or unauthorized'}), 404

    db.session.delete(reservation)
    db.session.commit()
    return jsonify({'message': f'Reservation {id} cancelled successfully'}), 200
