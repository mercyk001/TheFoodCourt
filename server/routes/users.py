from flask import Blueprint, request, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_jwt_extended import set_access_cookies, unset_jwt_cookies

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

    user = Customer.query.filter_by(email=email).first()
    role = 'customer'

    if not user:
        user = Owner.query.filter_by(email=email).first()
        role = 'owner'

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    user_id = user.id
    access_token = create_access_token(identity={"id": user_id, "role": role})

    response = make_response(jsonify({"message": "Login successful", "role": role}))
    set_access_cookies(response, access_token)  # Sets token in HTTP-only cookie

    return response, 200


#   Profile security
@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    print("JWT cookies received:", request.cookies)  # Debug logging
    identity = get_jwt_identity()
    print("JWT identity:", identity)  # Debug logging
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

# Logout endpoint
@users_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = make_response(jsonify({"message": "Logged out successfully"}))
    unset_jwt_cookies(response)
    return response, 200

