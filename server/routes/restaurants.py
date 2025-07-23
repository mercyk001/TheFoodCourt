
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Restaurant
from datetime import datetime
from sqlalchemy.exc import IntegrityError

restaurants_bp = Blueprint('restaurants', __name__, url_prefix='/restaurants')


# GET /restaurants - Public (returns basic restaurant info)
@restaurants_bp.route('/', methods=['GET'])
def get_restaurants():
    try:
        restaurants = Restaurant.query.all()
        return jsonify([restaurant.to_dict() for restaurant in restaurants]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch restaurants"}), 500


# GET /restaurants/<id> - Public (returns restaurant with menu items)
@restaurants_bp.route('/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    try:
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            return jsonify({"error": "Restaurant not found"}), 404
        
        # Include menu items in the response
        restaurant_data = restaurant.to_dict()
        restaurant_data['menu'] = [menu.to_dict() for menu in restaurant.menus]
        
        return jsonify(restaurant_data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch restaurant"}), 500


# POST /restaurants - Owner only
@restaurants_bp.route('/', methods=['POST'])
@jwt_required()
def create_restaurant():
    try:
        identity = get_jwt_identity()
        if identity["role"] != "owner":
            return jsonify({"error": "Only owners can create restaurants"}), 403

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Updated to match your model (cuisine instead of cuisine_type)
        required_fields = ['name', 'location', 'cuisine']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Check if restaurant name already exists for this owner
        existing = Restaurant.query.filter_by(
            name=data['name'], 
            owner_id=identity['id']
        ).first()
        
        if existing:
            return jsonify({"error": "You already have a restaurant with this name"}), 409

        new_restaurant = Restaurant(
            name=data['name'].strip(),
            location=data['location'].strip(),
            cuisine=data['cuisine'].strip(),  # Updated field name
            owner_id=identity['id'],
            created_at=datetime.utcnow()
        )

        db.session.add(new_restaurant)
        db.session.commit()

        return jsonify(new_restaurant.to_dict()), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database constraint violation"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create restaurant: {str(e)}"}), 500


# PATCH /restaurants/<id> - Owner only
@restaurants_bp.route('/<int:restaurant_id>', methods=['PATCH'])
@jwt_required()
def update_restaurant(restaurant_id):
    try:
        identity = get_jwt_identity()
        if identity["role"] != "owner":
            return jsonify({"error": "Only owners can update restaurants"}), 403

        restaurant = Restaurant.query.filter_by(
            id=restaurant_id, 
            owner_id=identity["id"]
        ).first()
        
        if not restaurant:
            return jsonify({"error": "Restaurant not found or not authorized"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Update fields if provided (updated field names)
        if 'name' in data and data['name']:
            restaurant.name = data['name'].strip()
        if 'location' in data and data['location']:
            restaurant.location = data['location'].strip()
        if 'cuisine' in data and data['cuisine']:  # Updated field name
            restaurant.cuisine = data['cuisine'].strip()

        db.session.commit()
        return jsonify(restaurant.to_dict()), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database constraint violation"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update restaurant: {str(e)}"}), 500


# DELETE /restaurants/<id> - Owner only
@restaurants_bp.route('/<int:restaurant_id>', methods=['DELETE'])
@jwt_required()
def delete_restaurant(restaurant_id):
    try:
        identity = get_jwt_identity()
        if identity["role"] != "owner":
            return jsonify({"error": "Only owners can delete restaurants"}), 403

        restaurant = Restaurant.query.filter_by(
            id=restaurant_id, 
            owner_id=identity["id"]
        ).first()
        
        if not restaurant:
            return jsonify({"error": "Restaurant not found or not authorized"}), 404

        # Check if restaurant has menu items
        if restaurant.menus:
            return jsonify({
                "error": "Cannot delete restaurant with existing menu items. Please delete all menu items first."
            }), 409

        db.session.delete(restaurant)
        db.session.commit()

        return jsonify({"message": "Restaurant deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete restaurant: {str(e)}"}), 500


# GET /restaurants/owner/my-restaurants - Owner only
@restaurants_bp.route('/owner/my-restaurants', methods=['GET'])
@jwt_required()
def get_my_restaurants():
    try:
        identity = get_jwt_identity()
        if identity["role"] != "owner":
            return jsonify({"error": "Only owners can access this endpoint"}), 403

        restaurants = Restaurant.query.filter_by(owner_id=identity["id"]).all()
        
        result = []
        for restaurant in restaurants:
            restaurant_data = restaurant.to_dict()
            restaurant_data['menu'] = [menu.to_dict() for menu in restaurant.menus]
            result.append(restaurant_data)
        
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch your restaurants"}), 500