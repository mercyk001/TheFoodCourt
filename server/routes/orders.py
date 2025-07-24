from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta, date
import traceback
from models import db, Order, OrderMeal, Meal, Reservation, Customer, Restaurant, Menu, Table

orders_bp = Blueprint('orders', __name__)


# Get customer's own orders
@orders_bp.route('/orders/my', methods=['GET'])
@jwt_required()
def get_customer_orders():
    current_user = get_jwt_identity()
    customer_id = current_user.get("id") if isinstance(current_user, dict) else current_user
    
    # Check if user is a customer
    if current_user.get("role") != "customer":
        return jsonify({"error": "Only customers can view their orders"}), 403
    
    try:
        # Get customer's confirmed orders directly using customer_id
        orders = Order.query.filter(
            Order.customer_id == customer_id,
            Order.is_confirmed == True
        ).order_by(Order.order_time.desc()).all()
        
        orders_data = []
        
        for order in orders:
            # Get order items
            order_meals = OrderMeal.query.filter_by(order_id=order.id).all()
            items_list = []
            
            for order_meal in order_meals:
                meal = Meal.query.get(order_meal.meal_id)
                if meal:
                    # Get menu item to get price
                    menu_item = Menu.query.filter_by(
                        meal_id=meal.id,
                        restaurant_id=order.restaurant_id
                    ).first()
                    
                    if menu_item:
                        items_list.append({
                            "name": meal.name,
                            "quantity": order_meal.quantity,
                            "price": menu_item.price,
                            "subtotal": order_meal.sub_total
                        })
            
            # Get restaurant info
            restaurant = Restaurant.query.get(order.restaurant_id) if order.restaurant_id else None
            restaurant_name = restaurant.name if restaurant else "Unknown Restaurant"
            
            # Get table info if there's a reservation
            table_number = "N/A"
            if order.reservation_id:
                reservation = Reservation.query.get(order.reservation_id)
                if reservation and reservation.table:
                    table_number = reservation.table.table_number
            
            orders_data.append({
                "id": f"ORD-{order.id:03d}",
                "order_id": order.id,
                "restaurant_name": restaurant_name,
                "items": items_list,
                "total": order.total_price or 0,
                "status": order.order_status,
                "order_date": order.order_time.isoformat() if order.order_time else None,
                "table_number": table_number,
                "estimated_serving_time": f"{order.estimated_serving_time} minutes" if order.estimated_serving_time else None
            })
        
        return jsonify({"data": orders_data}), 200
        
    except Exception as e:
        print(f"Error fetching customer orders: {e}")
        return jsonify({"error": str(e)}), 500


# Get all orders for restaurant owners
@orders_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    current_user = get_jwt_identity()
    user_id = current_user.get("id") if isinstance(current_user, dict) else current_user
    
    print(f"DEBUG: get_orders called by user_id: {user_id}")
    
    try:
        # Get restaurant IDs owned by the current user
        user_restaurants = Restaurant.query.filter_by(owner_id=user_id).all()
        restaurant_ids = [r.id for r in user_restaurants]
        
        print(f"DEBUG: User restaurants: {[r.name for r in user_restaurants]}")
        print(f"DEBUG: Restaurant IDs: {restaurant_ids}")
        
        if not restaurant_ids:
            print("DEBUG: No restaurants found for user")
            return jsonify({"data": []}), 200
        
        # Directly fetch orders for the owner's restaurants
        orders = Order.query.filter(
            Order.restaurant_id.in_(restaurant_ids),
            Order.is_confirmed == True
        ).order_by(Order.order_time.desc()).all()
        
        print(f"DEBUG: Found {len(orders)} orders for owner's restaurants")
        
        orders_data = []
        for order in orders:
            print(f"DEBUG: Processing order {order.id} for restaurant {order.restaurant_id}")
            
            # Get customer info
            customer = Customer.query.get(order.customer_id) if order.customer_id else None
            
            # Get restaurant info
            restaurant = Restaurant.query.get(order.restaurant_id) if order.restaurant_id else None
            
            # Get table info if there's a reservation
            table_info = "No Table"
            if order.reservation_id:
                reservation = Reservation.query.get(order.reservation_id)
                if reservation and reservation.table:
                    table_info = f"Table {reservation.table.table_number}"
            
            # Simple order data structure
            order_data = {
                "id": order.id,
                "orderId": f"#{order.id}",
                "customer": customer.username if customer else "Unknown Customer",
                "phone": customer.phone if customer else "",
                "table": table_info,
                "items": f"Order #{order.id} items",  # Simplified - just show order ID
                "total": f"KES {order.total_price:.2f}" if order.total_price else "KES 0.00",
                "status": order.order_status.title(),
                "order_time": order.order_time.isoformat() if order.order_time else None,
                "restaurant": restaurant.name if restaurant else "Unknown Restaurant"
            }
            
            orders_data.append(order_data)
            print(f"DEBUG: Added order {order.id} to results")
        
        print(f"DEBUG: Returning {len(orders_data)} orders for user")
        return jsonify({"data": orders_data}), 200
        
    except Exception as e:
        print(f"DEBUG: Error in get_orders: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# Create order directly from frontend cart data
@orders_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    current_user = get_jwt_identity()
    user_id = current_user.get("id") if isinstance(current_user, dict) else current_user
    
    try:
        data = request.get_json()
        items = data.get('items', [])
        special_instructions = data.get('special_instructions', '')
        total = data.get('total', 0)
        restaurant_id = data.get('restaurant_id')  # Accept restaurant_id from frontend
        table_id = data.get('table_id')  # Accept optional table_id from frontend
        reservation_id = data.get('reservation_id')  # Accept reservation_id from frontend
        
        if not items:
            return jsonify({"error": "No items in order"}), 400
        
        # If restaurant_id not provided, try to determine it from the first item
        if not restaurant_id and items:
            first_meal_id = items[0].get('meal_id')
            if first_meal_id:
                menu_item = Menu.query.filter_by(meal_id=first_meal_id).first()
                if menu_item:
                    restaurant_id = menu_item.restaurant_id
        
        if not restaurant_id:
            return jsonify({"error": "Restaurant ID could not be determined"}), 400
        
        # Verify all items are from the same restaurant
        for item in items:
            meal_id = item.get('meal_id')
            if meal_id:
                menu_item = Menu.query.filter_by(meal_id=meal_id).first()
                if menu_item and menu_item.restaurant_id != restaurant_id:
                    return jsonify({"error": "All items must be from the same restaurant"}), 400

        # Handle table/reservation logic
        final_reservation_id = None
        
        if reservation_id:
            # Use existing reservation from frontend
            reservation = Reservation.query.get(reservation_id)
            if not reservation:
                return jsonify({"error": "Reservation not found"}), 400
            
            # Verify reservation belongs to the current user
            if reservation.customer_id != user_id:
                return jsonify({"error": "Reservation does not belong to you"}), 403
            
            # Verify reservation is confirmed
            if reservation.status != 'confirmed':
                return jsonify({"error": "Reservation is not confirmed"}), 400
            
            final_reservation_id = reservation_id
            table_id = reservation.table_id  # Use table from reservation
            
        elif table_id:
            # Legacy: Create a reservation if table_id is provided but no reservation_id
            # Verify the table exists and is available
            table = Table.query.get(table_id)
            if not table:
                return jsonify({"error": "Selected table not found"}), 400
            
            if table.status != 'available':
                return jsonify({"error": "Selected table is not available"}), 400
            
            # Create a reservation for the selected table
            # Use current time as reservation time for immediate dining
            reservation = Reservation(
                customer_id=user_id,
                table_id=table_id,
                reservation_time=datetime.utcnow(),
                members_count=1,  # Default to 1, could be made configurable
                duration=120,  # Default 2 hours
                status='confirmed'
            )
            db.session.add(reservation)
            db.session.flush()  # Get the reservation ID
            final_reservation_id = reservation.id

        # Create the order with foreign keys
        order = Order(
            customer_id=user_id,
            restaurant_id=restaurant_id,
            reservation_id=final_reservation_id,  # Link to reservation if available
            order_time=datetime.utcnow(),
            order_status='pending',
            is_confirmed=True
        )
        db.session.add(order)
        db.session.flush()  # Get the order ID
        
        # Add order items
        order_total = 0
        for item in items:
            meal_id = item.get('meal_id')
            quantity = item.get('quantity', 1)
            price = item.get('price', 0)
            
            order_meal = OrderMeal(
                order_id=order.id,
                meal_id=meal_id,
                quantity=quantity,
                date_time=datetime.utcnow(),
                sub_total=price * quantity
            )
            db.session.add(order_meal)
            order_total += price * quantity
        
        # Update the order total_price
        order.total_price = order_total
        
        db.session.commit()
        
        # Prepare response with table information if applicable
        response_data = {
            "message": "Order created successfully",
            "order_id": order.id,
            "total": order_total,
            "estimated_serving_time_minutes": 20
        }
        
        if final_reservation_id:
            table = Table.query.get(table_id)
            if table:
                response_data["table_info"] = {
                    "table_number": table.table_number,
                    "table_id": table.id,
                    "reservation_id": final_reservation_id
                }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/orders/<int:order_id>/status', methods=['PATCH'])
@jwt_required()
def update_order_status(order_id):
    current_user = get_jwt_identity()
    user_id = current_user.get("id") if isinstance(current_user, dict) else current_user
    
    print(f"DEBUG: update_order_status called by user_id: {user_id} for order_id: {order_id}")
    
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({"error": "Status is required"}), 400
    
    # Validate status
    allowed_statuses = ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'completed', 'rejected']
    if new_status.lower() not in allowed_statuses:
        return jsonify({"error": "Invalid status"}), 400
    
    try:
        # Get the order
        order = Order.query.filter_by(id=order_id).first()
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        print(f"DEBUG: Order {order_id} belongs to restaurant_id: {order.restaurant_id}")
        
        # Check if order belongs to owner's restaurant using direct restaurant_id
        user_restaurants = Restaurant.query.filter_by(owner_id=user_id).all()
        restaurant_ids = [r.id for r in user_restaurants]
        
        print(f"DEBUG: User owns restaurants: {restaurant_ids}")
        
        if not restaurant_ids:
            return jsonify({"error": "Access denied"}), 403
        
        # Simple check: does this order belong to one of the user's restaurants?
        if order.restaurant_id not in restaurant_ids:
            print(f"DEBUG: Access denied - order restaurant_id {order.restaurant_id} not in user restaurants {restaurant_ids}")
            return jsonify({"error": "Access denied - Order does not belong to your restaurants"}), 403
        
        print(f"DEBUG: Updating order {order_id} status from {order.order_status} to {new_status}")
        
        # Update order status
        order.order_status = new_status.lower()
        db.session.commit()
        
        return jsonify({
            "message": "Order status updated successfully",
            "order_id": order_id,
            "new_status": new_status.title()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


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

    # Find existing cart for this customer using customer_id directly
    cart = Order.query.filter_by(
        customer_id=customer_id,
        is_cart=True,
        is_confirmed=False,
        order_status="cart"
    ).first()

    # If no cart found, create a temporary reservation and cart
    if not cart:
        # Create a temporary "cart" reservation for this customer
        temp_reservation = Reservation(
            customer_id=customer_id,
            table_id=1,  # Use a default table for cart purposes
            reservation_time=datetime.utcnow(),
            duration=60,  # Default duration
            members_count=1,
            status="cart"  # Special status for cart reservations
        )
        db.session.add(temp_reservation)
        db.session.flush()  # Get the ID
        
        cart = Order(
            reservation_id=temp_reservation.id,
            customer_id=customer_id,  # Set customer_id directly
            order_time=datetime.utcnow(),
            is_cart=True,
            is_confirmed=False,
            order_status="cart"
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

        # Set restaurant_id from the menu item if not already set
        if not cart.restaurant_id:
            cart.restaurant_id = menu_item.restaurant_id
        elif cart.restaurant_id != menu_item.restaurant_id:
            return jsonify({"error": "Cannot add items from different restaurants to the same order"}), 400

        order_item = OrderMeal.query.filter_by(order_id=cart.id, meal_id=meal_id).first()
        if order_item:
            order_item.quantity += quantity
            order_item.sub_total = order_item.quantity * menu_item.price
        else:
            order_item = OrderMeal(
                order_id=cart.id,
                meal_id=meal_id,
                quantity=quantity,
                date_time=datetime.utcnow(),
                sub_total=menu_item.price * quantity
            )
            db.session.add(order_item)

        db.session.commit()
        return get_cart(cart)
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def get_cart(cart):
    items = OrderMeal.query.filter_by(order_id=cart.id).all()
    response = []
    total = 0

    for item in items:
        meal = Meal.query.get(item.meal_id)
        if not meal:
            # Skip items with missing meals
            continue
            
        menu_item = Menu.query.filter_by(meal_id=meal.meal_id).first()
        if not menu_item:
            # Skip items with missing menu entries
            continue
            
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
        "cart_id": cart.id,
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
        cart_item = OrderMeal.query.filter_by(id=item_id, order_id=cart.id).first()
        if not cart_item:
            return jsonify({"error": "Item not found"}), 404

        if quantity <= 0:
            db.session.delete(cart_item)
        else:
            menu_item = Menu.query.filter_by(meal_id=cart_item.meal_id).first()
            cart_item.quantity = quantity
            cart_item.sub_total = menu_item.price * quantity

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
        cart_item = OrderMeal.query.filter_by(id=item_id, order_id=cart.id).first()
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

    # Find the customer's cart using customer_id directly
    cart = Order.query.filter_by(
        customer_id=customer_id,
        is_cart=True,
        is_confirmed=False,
        order_status="cart"
    ).first()

    if not cart:
        return jsonify({"error": "No cart found"}), 404

    cart_items = OrderMeal.query.filter_by(order_id=cart.id).all()
    if not cart_items:
        return jsonify({"error": "Cart is empty"}), 400

    total_items = sum(item.quantity for item in cart_items)
    estimated_time = 15 + (total_items * 5)

    # Convert cart to order
    cart.order_status = "received"
    cart.is_cart = False
    cart.is_confirmed = True
    cart.order_time = datetime.utcnow()
    cart.estimated_serving_time = timedelta(minutes=estimated_time)
    
    # Update the reservation status from "cart" to "confirmed" for proper order tracking
    if cart.reservation and cart.reservation.status == "cart":
        cart.reservation.status = "confirmed"

    try:
        db.session.commit()
        return jsonify({
            "message": "Order placed successfully",
            "order_id": cart.id,
            "customer_id": cart.customer_id,
            "restaurant_id": cart.restaurant_id,
            "estimated_serving_time_minutes": estimated_time
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
