from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import MetaData

metadata = MetaData()
db = SQLAlchemy(metadata=metadata)


class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    phone = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    class Order(db.Model):
        __tablename__ = 'orders'
        order_id = db.Column(db.Integer, primary_key=True)
        reservation_id = db.Column(
        db.Integer, db.ForeignKey('reservations.reservation_id'))
        order_status = db.Column(db.String(50))
        order_time = db.Column(db.DateTime, default=datetime.utcnow)
        table_number = db.Column(db.String(10))
        is_cart = db.Column(db.Boolean, default=True)
        is_confirmed = db.Column(db.Boolean, default=False)
        estimated_serving_time = db.Column(db.Interval)

    order_meals = db.relationship('OrderMeal', backref='order', lazy=True)



    def __repr__(self):
        return f'<User {self.username}>'
