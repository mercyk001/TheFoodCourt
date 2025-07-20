from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Restaurant
from datetime import datetime

restaurants_bp = Blueprint('restaurants', __name__, url_prefix='/restaurants')


# GET
@restaurants_bp.route('/', methods=['GET'])
def get_restaurants():
    restaurants = Restaurant.query.all()
    return jsonify([restaurant.to_dict() for restaurant in restaurants]), 200


# GET 
@restaurants_bp.route('/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):

    restaurant = Restaurant.query.filter_by(id=restaurant_id).first()
    if not restaurant:
        return jsonify({"message": "Restaurant not found"}), 404
    return jsonify(restaurant.to_dict()), 200


# POST
@restaurants_bp.route('/', methods=['POST'])
@jwt_required()
def create_restaurant():
    current_user = get_jwt_identity()
    owner_id = current_user.get('id')  

    data = request.get_json()

    required_fields = ['name', 'location', 'cuisine_type']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    new_restaurant = Restaurant(
        name=data['name'],
        location=data['location'],
        cuisine_type=data['cuisine_type'],
        owner_id=owner_id,
        created_at=datetime.utcnow()
    )

    db.session.add(new_restaurant)
    db.session.commit()

    return jsonify(new_restaurant.to_dict()), 201


# PATCH
@restaurants_bp.route('/<int:restaurant_id>', methods=['PATCH'])
#@jwt_required()
def update_restaurant(restaurant_id):
    #current_user = get_jwt_identity()
    restaurant = Restaurant.query.filter_by(id=restaurant_id).first()
    if not restaurant:
        return jsonify({"message": "Restaurant not found"}), 404

    data = request.get_json()

    restaurant.name = data.get('name', restaurant.name)
    restaurant.location = data.get('location', restaurant.location)
    restaurant.cuisine_type = data.get('cuisine_type', restaurant.cuisine_type)

    db.session.commit()
    return jsonify(restaurant.to_dict()), 200


# Delete a restaurant
@restaurants_bp.route('/<int:restaurant_id>', methods=['DELETE'])
#@jwt_required()
def delete_restaurant(restaurant_id):
   # current_user = get_jwt_identity()
    restaurant = Restaurant.query.filter_by(id=restaurant_id).first()
    if not restaurant:
        return jsonify({"message": "Restaurant not found"}), 404

    db.session.delete(restaurant)
    db.session.commit()

    return jsonify({"message": "Restaurant deleted successfully"}), 200