
from flask import Blueprint, request, jsonify
from models import db, Menu, Meal, Restaurant
from sqlalchemy.exc import IntegrityError

menu_bp = Blueprint('menu', __name__, url_prefix='/menus')

# Get all menu items


@menu_bp.route('/', methods=['GET'])
def get_menus():
    menus = Menu.query.all()
    return jsonify([menu.to_dict() for menu in menus]), 200

# Get a specific menu item


@menu_bp.route('/<int:id>', methods=['GET'])
def get_menu(id):
    menu = Menu.query.get(id)
    if not menu:
        return jsonify({"error": "Menu not found"}), 404
    return jsonify(menu.to_dict()), 200

# Create a new menu item


@menu_bp.route('/', methods=['POST'])
def create_menu():
    data = request.get_json()

    try:
        new_menu = Menu(
            meal_id=data['meal_id'],
            restaurant_id=data['restaurant_id'],
            name=data['name'],
            description=data.get('description'),
            price=data['price'],
            category=data['category'],
            image_url=data.get('image_url')
        )
        db.session.add(new_menu)
        db.session.commit()
        return jsonify(new_menu.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Invalid meal_id or restaurant_id"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete a menu item


@menu_bp.route('/<int:id>', methods=['DELETE'])
def delete_menu(id):
    menu = Menu.query.get(id)
    if not menu:
        return jsonify({"error": "Menu not found"}), 404
    db.session.delete(menu)
    db.session.commit()
    return jsonify({"message": "Menu item deleted"}), 200
