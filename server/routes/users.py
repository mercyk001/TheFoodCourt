
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, Customer, Owner


users_bp = Blueprint('users', __name__, url_prefix='/users')

# Register Customer
@users_bp.route('/register', methods=['POST'])
def register_customer():
    data = request.get_json()
    if Customer.query.filter((Customer.email == data['email']) | (Customer.phone == data['phone']) | (Customer.username == data['username'])).first():
        return jsonify({"error": "User with this email, phone, or username already exists"}), 400

    hashed_password = generate_password_hash(data['password'])
    new_customer = Customer(
        username=data['username'],
        phone=data['phone'],
        email=data['email'],
        password_hash=hashed_password
    )
    db.session.add(new_customer)
    db.session.commit()
    return jsonify({"message": "Customer registered successfully"}), 201

# Login Customer
@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = Customer.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity={"id": user.id, "role": "customer"})
    return jsonify({"access_token": access_token, "role": "customer"}), 200

# Protected route to get profile
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
