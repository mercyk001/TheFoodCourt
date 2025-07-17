from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import MetaData
from sqlalchemy import Enum
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
    status = db.Column(db.String, default='pending')

    customer = db.relationship('Customer', back_populates='reservations')
    table = db.relationship('Table', back_populates='reservations')
    
    serialize_rules = ('-customer.reservations', '-table.reservations')

    def __repr__(self):
        return f'<Reservation {self.id} for Customer {self.customer_id}>'
    
class Table(db.Model, SerializerMixin):
    __tablename__ = 'tables'
    
    id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.String, unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String, default='available')

    reservations = db.relationship('Reservation', back_populates='table')

    serialize_rules = ('-reservations.table',)
    def __repr__(self):
        return f'<Table {self.table_number} with capacity {self.capacity}>'
    
class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.Integer, db.ForeignKey('reservations.reservation_id'))
    order_status = db.Column(db.String(50))
    order_time = db.Column(db.DateTime, default=datetime.utcnow)
    table_number = db.Column(db.String(10))
    is_cart = db.Column(db.Boolean, default=True)
    is_confirmed = db.Column(db.Boolean, default=False)
    estimated_serving_time = db.Column(db.Interval)


    def __repr__(self):
        return f'<Order {self.id} for Reservation {self.reservation_id}>'

class Restaurant(db.Model, SerializerMixin):
    __tablename__ = 'restaurants'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    location = db.Column(db.String, nullable=False)
    cuisine_type = db.Column(db.String, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    serialize_rules = ('-orders.restaurant',)

    def __repr__(self):
        return f'<Restaurant {self.name}>'
    
class Menu(db.Model, SerializerMixin):
    __tablename__ = 'menu_items'
    
    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String, nullable=False)  # e.g., 'appetizer', 'main course', 'dessert'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    restaurant = db.relationship('Restaurant', back_populates='menu_items')

    serialize_rules = ('-restaurant.menu_items',)

    def __repr__(self):
        return f'<MenuItem {self.name} from {self.restaurant.name}>'
Restaurant.menu_items = db.relationship('MenuItem', order_by=MenuItem.id, back_populates='restaurant')


    
class Meal(db.Model, SerializerMixin):
    __tablename__ = 'meals'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    serialize_rules = ('-menu_items.meal',)

    def __repr__(self):
        return f'<Meal {self.name}>'
    
class OrderMeal(db.Model):
    __tablename__ = 'order_meals'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    date_time = db.Column(db.DateTime, default=datetime.utcnow)

    order = db.relationship('Order', back_populates='order_meals')
    meal = db.relationship('Meal', back_populates='order_meals')

    serialize_rules = ('-order.order_meals', '-meal.order_meals')

    def __repr__(self):
        return f'<OrderMeal {self.id} for Order {self.order_id}>'
    
class Owner(db.Model, SerializerMixin):
    __tablename__ = 'owners'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    phone = db.Column(db.String, unique=True, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    serialize_rules = ('-restaurants.owner',)

    def __repr__(self):
        return f'<Owner {self.name}>'
    
