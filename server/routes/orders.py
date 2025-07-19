from flask import Blueprint, request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from server import db
from server.models import Order, OrderMeal, Meal, Reservation, Customer, Restaurant, Menu
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders/cart', methods=['GET', 'POST', 'PUT', 'DELETE',])
@jwt_required()
def handle_cart():
    current_user_id = get_jwt_identity()
    
    cart = Order.query.filter_by(
        customer_id=current_user_id,
        is_cart=True,
        is_confirmed=False
    ).first()
    
    if not cart:
        cart = Order(
            customer_id=current_user_id,
            is_cart=True,
            is_confirmed=False,
            order_time=datetime.utcnow()
        )
        db.session.add(cart)
        db.session.commit()
        
    if request.method == 'GET':
        return get_cart(cart)
    elif request.method == 'POST':
        return add_to_cart(cart)
    elif request.method == 'PUT':
        return update_cart_item(cart)
    elif request.method == 'DELETE':
        return remove_from_cart(cart)

@orders_bp.route('/orders/cart', methods=['GET', 'POST', 'PUT', 'DELETE',])
@jwt_required()
def handle_cart():
    current_user_id = get_jwt_identity()
    
    cart = Order.query.filter_by(
        customer_id=current_user_id,
        is_cart=True,
        is_confirmed=False
    ).first()
    
    if not cart:
        cart = Order(
            customer_id=current_user_id,
            is_cart=True,
            is_confirmed=False,
            order_time=datetime.utcnow()
        )
        db.session.add(cart)
        db.session.commit()
        
    if request.method == 'GET':
        return get_cart(cart)
    elif request.method == 'POST':
        return add_to_cart(cart)
    elif request.method == 'PUT':
        return update_cart_item(cart)
    elif request.method == 'DELETE':
        return remove_from_cart(cart)
    
def get_cart(cart):
    try:
        cart_items = OrderMeal.query.filter_by(order_id=cart.id).all()
        items_with_details = []
        total = 0
        
        for item in cart_items:
            meal = Meal.query.get(item.meal_id)
            menu_item = Menu.query.filter_by(meal_id=meal.id).first()
            restaurant = Restaurant.query.get(menu_item.restaurant_id)
            
            items_with_details.append({
                "order_meal_id": item.id,
                "meal_id":meal.id,
                "name": meal.name,
                "description": meal.description,
                "price": menu_item.price,
                "quantity": item.quantity,
                "subtotal": menu_item.price * item.quantity,
                "restaurant": restaurant.name,
                "cuisine_type": restaurant.cuisine_type
            })
            total += menu_item.price + item.quantity
            
        return jsonify({
            "cart_id": cart.id,
            "items": items_with_details,
            "total": total,
            "item_count": len(items_with_details)
        }), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    
def update_cart_item(cart):
    data = request.get_json()
    order_meal_id = data.get('order_meal_id')
    quantity = data.get('quantity')
        
    if not all([order_meal_id, quantity]):
        return jsonify({"error": "Order meal ID and quantity are required"}), 400
    
    try:
        cart_item = Order_Meal.query.filter_by(
            id=order_meal_id,
            order_id=cart.id
        ).first()
        
        if not cart_item:
            return jsonify({"error": "Item not found in cart"}), 404
        
        if quantity <= 0:
            db.session.delete(cart_item)
        else:
            cart_item.quantity = quantity
            
        db.session.commit()
        return get_cart(cart)
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@orders_bp.route('/orders/checkout', methods=['POST'])    
@jwt_required()
def checkout():
    current_user_id = get_jwt_identity()
    
    try:
        cart = Order.query.filter_by(
            customer_id=current_user_id,
            is_cart=True,
            is_confirmed=False
        ).first()
        
        if not cart:
            return jsonify({"error": "No cart found"}), 404
        
        cart_items = OrderMeal.query.filter_by(order_id=cart.id).all()
        if not cart_items:
            return jsonify({"error": "Cart is empty"}), 400
        
        cart.is_cart = False
        cart.is_confirmed = True
        cart.order_status = "received"
        cart.order_time = datetime.utcnow()
        
        base_time = 15
        per_item_time = 5
        total_items = sum(item.quantity for item in cart_items)
        estimated_minutes = base_time + (per_item_time * total_items)
        cart.estimated_serving_time = timedelta(minutes=estimated_minutes)
        
        db.session.commit()
        
        return jsonify({
            "message": "Order placed successfully",
            "order_id": cart.id,
            "estimated_serving_time": estimated_minutes
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500