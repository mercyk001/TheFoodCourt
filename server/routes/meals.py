from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Meal, Menu
from sqlalchemy.exc import IntegrityError

meals_bp = Blueprint('meals', __name__, url_prefix='/meals')

@meals_bp.route('/', methods=['GET'])
def get_meals():
    meals = Meal.query.all()
    return jsonify([meal.to_dict() for meal in meals]), 200

@meals_bp.route('/<int:id>', methods=['GET'])
def get_meal(id):
    meal = Meal.query.get(id)
    if not meal:
        return jsonify({"error": "Meal not found"}), 404
    return jsonify(meal.to_dict()), 200

@meals_bp.route('/', methods=['POST'])
@jwt_required()
def create_meal():
    data = request.get_json()
    
    try:
        new_meal = Meal(
            name=data['name'],
            description=data.get('description'),
            category=data['category']
        )
        db.session.add(new_meal)
        db.session.commit()
        return jsonify(new_meal.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    
@meals_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_meal(id):
    meal = Meal.query.get(id)
    if not meal:
        return jsonify({"error": "Meal not found"}), 404

    data = request.get_json()
    try:
        meal.name = data.get('name', meal.name)
        meal.description = data.get('description', meal.description)
        meal.category = data.get('category', meal.category)
        db.session.commit()
        return jsonify(meal.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    
@meals_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_meal(id):
    meal = Meal.query.get(id)
    if not meal:
        return jsonify({"error": "Meal not found"}), 404
        
    db.session.delete(meal)
    db.session.commit()
    return jsonify({"message": "Meal deleted successfully"}), 200
