from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Table, Reservation
from datetime import datetime

tables_bp = Blueprint('tables', __name__, url_prefix='/tables')
