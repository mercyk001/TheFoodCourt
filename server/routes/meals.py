from flask import Blueprint, request, jsonify
from models import db, Meal, Menu
from sqlalchemy.exc import IntegrityError

meals_bp = Blueprint('meals', __name__, url_prefix='/meals')