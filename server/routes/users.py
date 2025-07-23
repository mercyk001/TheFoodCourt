from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from models import db, Customer, Owner, Restaurant

users_bp = Blueprint('users', __name__, url_prefix='/users')

# Register Customer 
@users_bp.route('/register/customer', methods=['POST'])
def register_customer():
    data = request.get_json()
    if Customer.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = generate_password_hash(data['password'])
    new_customer = Customer(
        username=data['username'],
        phone=data['phone'],
        email=data['email'],
        password_hash=hashed_password,
        role='customer'
    )
    db.session.add(new_customer)
    db.session.commit()

    return jsonify({"message": "Customer registered successfully"}), 201


# Register Owner + Restaurant
@users_bp.route('/register/owner', methods=['POST'])
def register_owner():
    data = request.get_json()

    if Owner.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = generate_password_hash(data['password'])
    new_owner = Owner(
        username=data['username'],
        email=data['email'],
        phone_number=data['phone_number'],
        password_hash=hashed_password,
        role='owner'
    )
    db.session.add(new_owner)
    db.session.commit()

    # Register first restaurant
    restaurant_data = data.get('restaurant')
    if not restaurant_data:
        return jsonify({"error": "Restaurant details are required for owner registration"}), 400

    new_restaurant = Restaurant(
        owner_id=new_owner.id,
        name=restaurant_data['name'],
        location=restaurant_data['location'],
        cuisine_type=restaurant_data['cuisine_type']
    )
    db.session.add(new_restaurant)
    db.session.commit()

    return jsonify({"message": "Owner and restaurant registered successfully"}), 201


# Login is shared by both customer and owner
@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Try customer first
    user = Customer.query.filter_by(email=email).first()
    role = 'customer'

    if not user:
        user = Owner.query.filter_by(email=email).first()
        role = 'owner'

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    user_id = user.id
    token = create_access_token(identity={"id": user_id, "role": role})

    return jsonify({"access_token": token, "role": role}), 200


# Specific login endpoint for restaurant owners
@users_bp.route('/login/owner', methods=['POST'])
def login_owner():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Only check owner table
    owner = Owner.query.filter_by(email=email).first()

    if not owner or not check_password_hash(owner.password_hash, password):
        return jsonify({"error": "Invalid restaurant owner credentials"}), 401

    # Create token with owner identity
    token = create_access_token(identity={"id": owner.id, "role": "owner"})

    # Return owner details with token
    return jsonify({
        "access_token": token,
        "role": "owner",
        "user": {
            "id": owner.id,
            "username": owner.username,
            "email": owner.email,
            "phone": owner.phone_number,
            "restaurants": [
                {
                    "id": r.id,
                    "name": r.name,
                    "location": r.location,
                    "cuisine_type": r.cuisine_type
                }
                for r in owner.restaurants
            ]
        }
    }), 200


# Specific login endpoint for customers
@users_bp.route('/login/customer', methods=['POST'])
def login_customer():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Only check customer table
    customer = Customer.query.filter_by(email=email).first()

    if not customer or not check_password_hash(customer.password_hash, password):
        return jsonify({"error": "Invalid customer credentials"}), 401

    # Create token with customer identity
    token = create_access_token(identity={"id": customer.id, "role": "customer"})

    # Return customer details with token
    return jsonify({
        "access_token": token,
        "role": "customer",
        "user": {
            "id": customer.id,
            "username": customer.username,
            "email": customer.email,
            "phone": customer.phone
        }
    }), 200


#   Profile security
@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    identity = get_jwt_identity()
    user_id = identity['id']
    role = identity['role']

    if role == 'customer':
        user = Customer.query.get(user_id)
        if not user:
            return jsonify({"error": "Customer not found"}), 404
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        })

    elif role == 'owner':
        user = Owner.query.get(user_id)
        if not user:
            return jsonify({"error": "Owner not found"}), 404

        restaurants = [
            {
                "id": r.id,
                "name": r.name,
                "location": r.location,
                "cuisine_type": r.cuisine_type
                
            }
            for r in user.restaurants
        ]

        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone_number,
            "role": user.role,
            "restaurants": restaurants
        })
    
@users_bp.route('/me', methods=['PATCH'])
@jwt_required()
def update_profile():
    identity = get_jwt_identity()
    user_id = identity['id']
    role = identity['role']
    data = request.get_json()

    if role == 'customer':
        user = Customer.query.get(user_id)
    elif role == 'owner':
        user = Owner.query.get(user_id)
    else:
        return jsonify({"error": "Invalid role"}), 403

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update fields if present
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'phone' in data or 'phone_number' in data:
        user.phone = data.get('phone') or data.get('phone_number')

    db.session.commit()

    return jsonify({"message": "Profile updated successfully"}), 200

