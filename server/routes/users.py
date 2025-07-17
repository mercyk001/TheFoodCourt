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