from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@localhost/yourdatabase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Customer(db.Model):
    __tablename__ = 'customer'
    customer_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String)
    phone = db.Column(db.String)
    email = db.Column(db.String)
    password = db.Column(db.String)

class Table(db.Model):
    __tablename__ = 'table'
    table_id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.String)
    status = db.Column(db.String)  # available, reserved, occupied

class Reservation(db.Model):
    __tablename__ = 'reservations'
    reservation_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'))
    table_id = db.Column(db.Integer, db.ForeignKey('table.table_id'))
    booking_time = db.Column(db.TIMESTAMP)
    duration = db.Column(db.Interval)
    members_no = db.Column(db.Integer)
    status = db.Column(db.String)



@app.route('/reservations', methods=['GET'])
def list_reservations():
    reservations = Reservation.query.all()
    return jsonify([
        {
            'reservation_id': r.reservation_id,
            'customer_id': r.customer_id,
            'table_id': r.table_id,
            'booking_time': r.booking_time.isoformat(),
            'duration': str(r.duration),
            'members_no': r.members_no,
            'status': r.status
        } for r in reservations
    ])

@app.route('/reservations', methods=['POST'])
def create_reservation():
    data = request.get_json()
    try:
        new_res = Reservation(
            customer_id=data['customer_id'],
            table_id=data['table_id'],
            booking_time=datetime.fromisoformat(data['booking_time']),
            duration=timedelta(minutes=int(data['duration_minutes'])),
            members_no=data['members_no'],
            status=data.get('status', 'reserved')
        )
        db.session.add(new_res)
        db.session.commit()
        return jsonify({'message': 'Reservation created', 'reservation_id': new_res.reservation_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/reservations/<int:reservation_id>', methods=['GET'])
def get_reservation(reservation_id):
    r = Reservation.query.get_or_404(reservation_id)
    return jsonify({
        'reservation_id': r.reservation_id,
        'customer_id': r.customer_id,
        'table_id': r.table_id,
        'booking_time': r.booking_time.isoformat(),
        'duration': str(r.duration),
        'members_no': r.members_no,
        'status': r.status
    })


if __name__ == '__main__':
    app.run(debug=True)
