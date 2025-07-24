from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Owner, Restaurant, Menu, Order, Meal, OrderMeal, Reservation, Customer
from datetime import datetime, date
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

    # Validate required fields
    if 'restaurant_id' not in data:
        return jsonify({'error': 'Missing restaurant_id'}), 400
    if 'price' not in data or 'category' not in data or 'name' not in data:
        return jsonify({'error': 'Missing required menu fields'}), 400

    restaurant = Restaurant.query.get(data['restaurant_id'])
    if not restaurant or restaurant.owner_id != identity['id']:
        return jsonify({'error': 'Unauthorized restaurant access'}), 403

    # Check if meal exists by ID, otherwise create new one
    meal = None
    meal_id = data.get('meal_id')
    if meal_id:
        meal = Meal.query.get(meal_id)

    if not meal:
        meal = Meal(
            name=data['name'],
            food_description=data.get('description', '')
        )
        db.session.add(meal)
        db.session.flush()  # ensure meal.id is available

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

# View all orders for the owner's restaurants
@dashboard_bp.route('/orders', methods=['GET'])
@owner_required
def view_orders():
    identity = get_jwt_identity()
    owner_id = identity['id']

    orders = Order.query.join(Order.reservation).join(Order.reservation.table).join(Order.reservation.table.restaurant)
    orders = orders.filter(Restaurant.owner_id == owner_id).all()

    return jsonify([order.to_dict_safe() for order in orders]), 200

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

    return jsonify(order.to_dict_safe()), 200


# Test endpoint to check restaurant data (remove in production)
@dashboard_bp.route('/test/restaurants', methods=['GET'])
def test_restaurant_data():
    try:
        # Get all restaurants
        all_restaurants = Restaurant.query.all()
        restaurant_data = [
            {
                "id": r.id,
                "name": r.name,
                "owner_id": r.owner_id,
                "location": r.location,
                "cuisine_type": r.cuisine_type
            }
            for r in all_restaurants
        ]
        
        # Get all owners
        all_owners = Owner.query.all()
        owner_data = [
            {
                "id": o.id,
                "username": o.username,
                "email": o.email
            }
            for o in all_owners
        ]
        
        return jsonify({
            "restaurants": restaurant_data,
            "owners": owner_data,
            "total_restaurants": len(all_restaurants),
            "total_owners": len(all_owners)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get restaurant count for owner - simplified
@dashboard_bp.route('/stats/restaurants', methods=['GET'])
@owner_required
def get_restaurant_stats():
    identity = get_jwt_identity()
    user_id = identity['id']
    
    try:
        # Direct query to get restaurants for this owner
        restaurant_count = Restaurant.query.filter_by(owner_id=user_id).count()
        
        print(f"Restaurant stats - Owner ID: {user_id}, Count: {restaurant_count}")
        
        response_data = {
            "activeOutlets": restaurant_count,
            "totalOutlets": restaurant_count
        }
        
        print(f"Restaurant stats response: {response_data}")
        
        return jsonify(response_data), 200
    except Exception as e:
        print(f"Error in get_restaurant_stats: {e}")
        return jsonify({"error": str(e)}), 500

# Get order stats for owner
@dashboard_bp.route('/stats/orders', methods=['GET'])
@owner_required
def get_order_stats():
    identity = get_jwt_identity()
    user_id = identity['id']
    
    try:
        # Get owner's restaurants
        user_restaurants = Restaurant.query.filter_by(owner_id=user_id).all()
        restaurant_ids = [r.id for r in user_restaurants]
        
        if not restaurant_ids:
            return jsonify({
                "todaysOrders": 0,
                "pendingOrders": 0,
                "totalRevenue": 0
            }), 200
        
        # Today's date
        today = date.today()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        # Get all confirmed orders
        all_orders = Order.query.filter(Order.is_confirmed == True).all()
        
        todays_orders = 0
        pending_orders = 0
        total_revenue = 0
        
        for order in all_orders:
            # Check if order has items from owner's restaurants
            order_meals = OrderMeal.query.filter_by(order_id=order.id).all()
            
            has_owner_items = False
            order_revenue = 0
            
            for order_meal in order_meals:
                meal = Meal.query.get(order_meal.meal_id)
                if meal:
                    menu_item = Menu.query.filter_by(meal_id=meal.id).first()
                    if menu_item and menu_item.restaurant_id in restaurant_ids:
                        has_owner_items = True
                        order_revenue += order_meal.quantity * menu_item.price
            
            if has_owner_items:
                total_revenue += order_revenue
                
                # Check if order is from today
                if order.order_time and today_start <= order.order_time <= today_end:
                    todays_orders += 1
                
                # Check if order is pending
                if order.order_status and order.order_status.lower() in ['pending', 'received']:
                    pending_orders += 1
        
        return jsonify({
            "todaysOrders": todays_orders,
            "pendingOrders": pending_orders,
            "totalRevenue": total_revenue
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get booking stats
@dashboard_bp.route('/stats/bookings', methods=['GET'])
@owner_required
def get_booking_stats():
    try:
        # Count all reservations with confirmed or pending status
        total_bookings = Reservation.query.filter(
            Reservation.status.in_(['confirmed', 'pending'])
        ).count()
        
        return jsonify({
            "tableBookings": total_bookings
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
