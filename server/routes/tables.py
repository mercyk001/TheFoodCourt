from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Table, Reservation
from datetime import datetime

tables_bp = Blueprint('tables', __name__, url_prefix='/tables')

@tables_bp.route('/', methods=['GET'])
def get_tables():
    tables = Table.query.all()
    return jsonify([table.to_dict() for table in tables]), 200

@tables_bp.route('/<int:id>', methods=['GET'])
def get_table(id):
    table = Table.query.get(id)
    if not table:
        return jsonify({"error": "Table not found"}), 404
    return jsonify(table.to_dict()), 200