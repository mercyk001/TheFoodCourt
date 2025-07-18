from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import db, Customer, Owner

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
        phone=data.get('phone'),
        email=data['email'],
        password=hashed_password
    )
    db.session.add(new_customer)
    db.session.commit()
    return jsonify({"message": "Customer registered successfully"}), 201


# Login sharing endpoint for customer and owner
@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check customer
    user = Customer.query.filter_by(email=email).first()
    role = 'customer'
    if not user:
        # Check owner
        user = Owner.query.filter_by(email=email).first()
        role = 'owner'

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity={"id": user.id if role == 'owner' else user.customer_id, "role": role})
    return jsonify({"access_token": access_token, "role": role}), 200