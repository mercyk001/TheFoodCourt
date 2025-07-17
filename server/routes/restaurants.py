from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Restaurant
from datetime import datetime

restaurants_bp = Blueprint('restaurants', __name__)

@restaurants_bp.route('/', methods=['GET'])
@jwt_required()
def get_restaurants():
    current_user = get_jwt_identity()
    restaurants = Restaurant.query.filter_by(user_id=current_user).all()
    return jsonify([restaurant.to_dict() for restaurant in restaurants]), 200

@restaurants_bp.route('/<int:restaurant_id>', methods=['GET'])
@jwt_required()
def get_restaurant(restaurant_id):
    current_user = get_jwt_identity()
    restaurant = Restaurant.query.filter_by(id=restaurant_id, user_id=current_user).first()
    if not restaurant:
        return jsonify({"message": "Restaurant not found"}), 404
    return jsonify(restaurant.to_dict()), 200