from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Owner, Restaurant, Menu, Order, Meal
from functools import wraps


dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

# Decorator to ensure only owners can access

def owner_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        identity = get_jwt_identity()
        if identity['role'] != 'owner':
            return jsonify({'error': 'Only owners can access this resource'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Create a new restaurant
@dashboard_bp.route('/restaurants', methods=['POST'])
@owner_required
def create_restaurant():
    identity = get_jwt_identity()
    data = request.get_json()

    restaurant = Restaurant(
        owner_id=identity['id'],
        name=data['name'],
        location=data['location'],
        cuisine_type=data['cuisine_type']
    )
    db.session.add(restaurant)
    db.session.commit()
    return jsonify(restaurant.to_dict()), 201

# Update or delete a restaurant
@dashboard_bp.route('/restaurants/<int:id>', methods=['PUT', 'DELETE'])
@owner_required
def manage_restaurant(id):
    identity = get_jwt_identity()
    restaurant = Restaurant.query.get(id)

    if not restaurant or restaurant.owner_id != identity['id']:
        return jsonify({'error': 'Not found or unauthorized'}), 404

    if request.method == 'PUT':
        data = request.get_json()
        restaurant.name = data.get('name', restaurant.name)
        restaurant.location = data.get('location', restaurant.location)
        restaurant.cuisine_type = data.get('cuisine_type', restaurant.cuisine_type)
        db.session.commit()
        return jsonify(restaurant.to_dict()), 200

    db.session.delete(restaurant)
    db.session.commit()
    return jsonify({'message': 'Restaurant deleted'}), 200

# Create a menu item
@dashboard_bp.route('/menus', methods=['POST'])
@owner_required
def create_menu():
    identity = get_jwt_identity()
    data = request.get_json()

    restaurant = Restaurant.query.get(data['restaurant_id'])
    if not restaurant or restaurant.owner_id != identity['id']:
        return jsonify({'error': 'Unauthorized restaurant access'}), 403

    # Check if meal exists or create
    meal = Meal.query.get(data.get('meal_id'))
    if not meal:
        meal = Meal(
            name=data.get('name'),
            food_description=data.get('description', '')
        )
        db.session.add(meal)
        db.session.flush()  # get meal.id

    menu = Menu(
        restaurant_id=restaurant.id,
        meal_id=meal.id,
        name=data.get('name', meal.name),
        description=data.get('description', meal.food_description),
        price=data['price'],
        category=data['category'],
        image_url=data.get('image_url')
    )
    db.session.add(menu)
    db.session.commit()
    return jsonify(menu.to_dict()), 201

# Update or delete a menu item
@dashboard_bp.route('/menus/<int:id>', methods=['PUT', 'DELETE'])
@owner_required
def manage_menu(id):
    identity = get_jwt_identity()
    menu = Menu.query.get(id)

    if not menu or menu.restaurant.owner_id != identity['id']:
        return jsonify({'error': 'Not found or unauthorized'}), 404

    if request.method == 'PUT':
        data = request.get_json()
        menu.name = data.get('name', menu.name)
        menu.description = data.get('description', menu.description)
        menu.price = data.get('price', menu.price)
        menu.category = data.get('category', menu.category)
        menu.image_url = data.get('image_url', menu.image_url)
        db.session.commit()
        return jsonify(menu.to_dict()), 200

    db.session.delete(menu)
    db.session.commit()
    return jsonify({'message': 'Menu deleted'}), 200

# View all orders for the owner's restaurants
@dashboard_bp.route('/orders', methods=['GET'])
@owner_required
def view_orders():
    identity = get_jwt_identity()
    owner_id = identity['id']

    orders = Order.query.join(Order.reservation).join(Order.reservation.table).join(Order.reservation.table.restaurant)
    orders = orders.filter(Restaurant.owner_id == owner_id).all()

    return jsonify([order.to_dict() for order in orders]), 200

# Update order details
@dashboard_bp.route('/orders/<int:id>', methods=['PUT'])
@owner_required
def update_order(id):
    identity = get_jwt_identity()
    order = Order.query.get(id)

    if not order or order.reservation.table.restaurant.owner_id != identity['id']:
        return jsonify({'error': 'Not found or unauthorized'}), 404

    data = request.get_json()
    order.order_status = data.get('order_status', order.order_status)
    order.is_confirmed = data.get('is_confirmed', order.is_confirmed)
    order.estimated_serving_time = data.get('estimated_serving_time', order.estimated_serving_time)
    db.session.commit()

    return jsonify(order.to_dict()), 200
