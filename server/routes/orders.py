from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta, date
from models import db, Order, OrderMeal, Meal, Reservation, Customer, Restaurant, Menu

orders_bp = Blueprint('orders', __name__)


#  Improved readability
def get_today_reservation(customer_id):
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())

    return Reservation.query.filter(
        Reservation.customer_id == customer_id,
        Reservation.reservation_time >= today_start,
        Reservation.reservation_time <= today_end,
        Reservation.status == "confirmed"  # Only confirmed reservations are allowed
    ).first()


@orders_bp.route('/orders/cart', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def handle_cart():
    current_user = get_jwt_identity()
    customer_id = current_user.get("id") if isinstance(current_user, dict) else current_user

    reservation = get_today_reservation(customer_id)
    if not reservation:
        return jsonify({"error": "No valid reservation found for today"}), 400

    cart = Order.query.filter_by(
        reservation_id=reservation.id,
        is_cart=True,
        is_confirmed=False
    ).first()

    if not cart:
        cart = Order(
            reservation_id=reservation.id,
            order_time=datetime.utcnow(),
            table_number=str(reservation.table_id),
            is_cart=True,
            is_confirmed=False,
            order_status="pending"
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


def add_to_cart(cart):
    data = request.get_json()
    meal_id = data.get("meal_id")
    quantity = data.get("quantity", 1)

    if not meal_id:
        return jsonify({"error": "Meal ID is required"}), 400

    try:
        menu_item = Menu.query.filter_by(meal_id=meal_id).first()
        if not menu_item:
            return jsonify({"error": "Meal not in menu"}), 404

        order_item = OrderMeal.query.filter_by(order_id=cart.order_id, meal_id=meal_id).first()
        if order_item:
            order_item.quantity += quantity
            order_item.subtotal = order_item.quantity * menu_item.price
        else:
            order_item = OrderMeal(
                order_id=cart.order_id,
                meal_id=meal_id,
                quantity=quantity,
                date_time=datetime.utcnow(),
                subtotal=menu_item.price * quantity
            )
            db.session.add(order_item)

        db.session.commit()
        return get_cart(cart)
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def get_cart(cart):
    items = OrderMeal.query.filter_by(order_id=cart.order_id).all()
    response = []
    total = 0

    for item in items:
        meal = Meal.query.get(item.meal_id)
        menu_item = Menu.query.filter_by(meal_id=meal.meal_id).first()
        subtotal = item.quantity * menu_item.price
        total += subtotal

        response.append({
            "order_meal_id": item.id,
            "meal_id": meal.meal_id,
            "name": meal.name,
            "description": meal.description,
            "price": menu_item.price,
            "quantity": item.quantity,
            "subtotal": subtotal
        })

    return jsonify({
        "cart_id": cart.order_id,
        "reservation_id": cart.reservation_id,
        "items": response,
        "total": total,
        "item_count": len(response)
    }), 200


def update_cart_item(cart):
    data = request.get_json()
    item_id = data.get("order_meal_id")
    quantity = data.get("quantity")

    if not all([item_id, quantity]):
        return jsonify({"error": "order_meal_id and quantity required"}), 400

    try:
        cart_item = OrderMeal.query.filter_by(id=item_id, order_id=cart.order_id).first()
        if not cart_item:
            return jsonify({"error": "Item not found"}), 404

        if quantity <= 0:
            db.session.delete(cart_item)
        else:
            menu_item = Menu.query.filter_by(meal_id=cart_item.meal_id).first()
            cart_item.quantity = quantity
            cart_item.subtotal = menu_item.price * quantity

        db.session.commit()
        return get_cart(cart)
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def remove_from_cart(cart):
    data = request.get_json()
    item_id = data.get("order_meal_id")

    if not item_id:
        return jsonify({"error": "order_meal_id required"}), 400

    try:
        cart_item = OrderMeal.query.filter_by(id=item_id, order_id=cart.order_id).first()
        if not cart_item:
            return jsonify({"error": "Item not in cart"}), 404

        db.session.delete(cart_item)
        db.session.commit()
        return get_cart(cart)
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/orders/checkout', methods=['POST'])
@jwt_required()
def checkout():
    current_user = get_jwt_identity()
    customer_id = current_user.get("id") if isinstance(current_user, dict) else current_user

    reservation = get_today_reservation(customer_id)
    if not reservation:
        return jsonify({"error": "No reservation for today"}), 400

    cart = Order.query.filter_by(
        reservation_id=reservation.id,
        is_cart=True,
        is_confirmed=False
    ).first()

    if not cart:
        return jsonify({"error": "No cart found"}), 404

    cart_items = OrderMeal.query.filter_by(order_id=cart.order_id).all()
    if not cart_items:
        return jsonify({"error": "Cart is empty"}), 400

    total_items = sum(item.quantity for item in cart_items)
    estimated_time = 15 + (total_items * 5)

    cart.order_status = "received"
    cart.is_cart = False
    cart.is_confirmed = True
    cart.order_time = datetime.utcnow()
    cart.estimated_serving_time = timedelta(minutes=estimated_time)

    try:
        db.session.commit()
        return jsonify({
            "message": "Order placed successfully",
            "order_id": cart.order_id,
            "estimated_serving_time_minutes": estimated_time
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
