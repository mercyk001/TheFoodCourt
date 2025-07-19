from flask import Blueprint, request, jsonify
from models import db, Reservation
from datetime import datetime

reservations_bp = Blueprint('reservations', __name__, url_prefix='/reservations')


# POST /reservations

@reservations_bp.route('', methods=['POST'])
def create_reservation():
    data = request.get_json()
    try:
        reservation = Reservation(
            customer_id=data['customer_id'],
            table_id=data['table_id'],
            reservation_time=datetime.fromisoformat(data.get('reservation_time', datetime.utcnow().isoformat())),
            duration=data['duration'],
            members_count=data['members_count'],
            status=data.get('status', 'pending')
        )
        db.session.add(reservation)
        db.session.commit()
        return jsonify(reservation.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# GET /reservations
@reservations_bp.route('', methods=['GET'])
def get_reservations():
    reservations = Reservation.query.all()
    return jsonify([r.to_dict() for r in reservations]), 200

# GET /reservations/<id>

@reservations_bp.route('/<int:id>', methods=['GET'])
def get_reservation(id):
    reservation = Reservation.query.get(id)
    if reservation:
        return jsonify(reservation.to_dict()), 200
    return jsonify({'error': 'Reservation not found'}), 404

# PUT /reservations/<id>
@reservations_bp.route('/<int:id>', methods=['PUT'])
def update_reservation(id):
    reservation = Reservation.query.get(id)
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404

    data = request.get_json()
    try:
        reservation.customer_id = data.get('customer_id', reservation.customer_id)
        reservation.table_id = data.get('table_id', reservation.table_id)
        reservation.reservation_time = datetime.fromisoformat(
            data.get('reservation_time', reservation.reservation_time.isoformat())
        )
        reservation.duration = data.get('duration', reservation.duration)
        reservation.members_count = data.get('members_count', reservation.members_count)
        reservation.status = data.get('status', reservation.status)

        db.session.commit()
        return jsonify(reservation.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# DELETE /reservations/<id>

@reservations_bp.route('/<int:id>', methods=['DELETE'])
def delete_reservation(id):
    reservation = Reservation.query.get(id)
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404

    db.session.delete(reservation)
    db.session.commit()
    return jsonify({'message': f'Reservation {id} deleted successfully'}), 200