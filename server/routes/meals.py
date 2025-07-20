from flask import Blueprint, request, jsonify
from models import db, Meal, Menu
from sqlalchemy.exc import IntegrityError

meals_bp = Blueprint('meals', __name__, url_prefix='/meals')

@meals_bp.route('/', methods=['GET'])
def get_meals():
    meals = Meal.query.all()
    return jsonify([meal.to_dict() for meal in meals]), 200