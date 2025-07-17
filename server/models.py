from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import MetaData

metadata = MetaData()
db = SQLAlchemy(metadata=metadata)
    
class Customer(db.Model, SerializerMixin):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    phone = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.String(20), default='customer')
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
    orders = db.relationship('Order', back_populates='reservation')

    serialize_rules = ('-customer.reservations', '-table.reservations')

    def __repr__(self):
        return f'<Reservation {self.id} for Customer {self.customer_id} >'

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
    
    
class Order(db.Model, SerializerMixin):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.Integer, db.ForeignKey('reservations.id'))
    order_status = db.Column(db.String(50), nullable=False, default='pending')
    order_time = db.Column(db.DateTime, default=datetime.utcnow)
    is_cart = db.Column(db.Boolean, default=True)
    total_price = db.Column(db.Float, nullable=False, default=0.0)
    is_confirmed = db.Column(db.Boolean, default=False)
    estimated_serving_time = db.Column(db.Integer, nullable=True)  # Estimated serving time in minutes

    reservation = db.relationship('Reservation', back_populates='orders')
    order_meals = db.relationship('OrderMeal', back_populates='order', cascade='all, delete-orphan')

    serialize_rules = ('-reservation.orders', '-order_meals.order')


    def __repr__(self):
        return f'<Order {self.id} for Reservation {self.reservation_id}>'
    

class OrderMeal(db.Model, SerializerMixin):
    __tablename__ = 'order_meals'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    date_time = db.Column(db.DateTime, default=datetime.utcnow)
    sub_total = db.Column(db.Float, nullable=False)

    order = db.relationship('Order', back_populates='order_meals')
    meal = db.relationship('Meal', back_populates='order_meals')

    serialize_rules = ('-order.order_meals', '-meal.order_meals')

    def __repr__(self):
        return f'<OrderMeal {self.id} for Order {self.order_id} and Meal {self.meal_id}>'
    

class Meal(db.Model, SerializerMixin):
    __tablename__ = 'meals'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    food_description = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    menus = db.relationship('Menu', back_populates='meal')
    order_meals = db.relationship('OrderMeal', back_populates='meal')

    serialize_rules = ('-menus.meal', '-order_meals.meal')

    def __repr__(self):
        return f'<Meal {self.name}>'



class Menu(db.Model, SerializerMixin):
    __tablename__ = 'menus'
    
    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String, nullable=False)  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    restaurant = db.relationship('Restaurant', back_populates='menus')
    meal = db.relationship('Meal', back_populates='menus')

    
    serialize_rules = ('-restaurant.menus', '-meal.menus')

    def __repr__(self):
        return f'<Menu {self.name} for Restaurant {self.restaurant_id}>'



class Owner(db.Model, SerializerMixin):
    __tablename__ = 'owners'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    phone_number = db.Column(db.String, unique=True, nullable=False)
    role = db.Column(db.String(20), default='owner')  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    restaurants = db.relationship('Restaurant', back_populates='owner')

    serialize_rules = ('-restaurants.owner',)

    def __repr__(self):
        return f'<Owner {self.username} with email {self.email}>'
    

class Restaurant(db.Model, SerializerMixin):
    __tablename__ = 'restaurants'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('owners.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    location = db.Column(db.String, nullable=False)
    cuisine_type = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    owner = db.relationship('Owner', back_populates='restaurants')
    menus = db.relationship('Menu', back_populates='restaurant')

    serialize_rules = ('-owner.restaurants', '-menus.restaurant')

    def __repr__(self):
        return f'<Restaurant {self.name} located at {self.location}>'
    

