from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import MetaData
from sqlalchemy import Enum
metadata = MetaData()
db = SQLAlchemy(metadata=metadata)

class Customer(db.Model, SerializerMixin):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    phone = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reservations = db.relationship('Reservation', back_populates='customer')

    serialize_rules = ('-reservations.customer',)

    def __repr__(self):
        return f'<Customer {self.username}>'
    
class Reservation(db.Model, SerializerMixin):
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    table_id = db.Column(db.Integer, db.ForeignKey('tables.id'), nullable=False)
    reservation_time = db.Column(db.DateTime, default=datetime.utcnow)
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes
    members_count = db.Column(db.Integer, nullable=False)
    status = db.Column(Enum('pending', 'confirmed', 'canceled', name='reservation_status'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = db.relationship('Customer', back_populates='reservations')
    table = db.relationship('Table', back_populates='reservations')

    serialize_rules = ('-customer.reservations', '-table.reservations')

    def __repr__(self):
        return f'<Reservation {self.id} for Customer {self.customer_id}>'
    
class Table(db.Model, SerializerMixin):
    __tablename__ = 'tables'
    
    id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.String, unique=True, index=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    status = db.Column(Enum('available', 'reserved', 'occupied', name='table_status'), default='available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reservations = db.relationship('Reservation', back_populates='table')

    serialize_rules = ('-reservations.table',)
    def __repr__(self):
        return f'<Table {self.table_number} with capacity {self.capacity}>'