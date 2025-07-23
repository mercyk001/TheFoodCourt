from flask import Blueprint, request, jsonify
from models import db, Menu, Restaurant
from flask_jwt_extended import jwt_required, get_jwt_identity
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

# Create a new menu item (protected - only for owners)
@menu_bp.route('/', methods=['POST'])
@jwt_required()
def create_menu():
    identity = get_jwt_identity()
    if identity["role"] != "owner":
        return jsonify({"error": "Only owners can create menu items"}), 403

    data = request.get_json()
    restaurant = Restaurant.query.get(data["restaurant_id"])

    if not restaurant or restaurant.owner_id != identity["id"]:
        return jsonify({"error": "You are not authorized to add menu to this restaurant"}), 403

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

# Update menu (PATCH) - only owner of restaurant can update
@menu_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def update_menu(id):
    identity = get_jwt_identity()
    if identity["role"] != "owner":
        return jsonify({"error": "Only owners can update menu items"}), 403

    menu = Menu.query.get(id)
    if not menu:
        return jsonify({"error": "Menu not found"}), 404

    if menu.restaurant.owner_id != identity["id"]:
        return jsonify({"error": "You are not authorized to update this menu"}), 403

    data = request.get_json()
    menu.name = data.get('name', menu.name)
    menu.description = data.get('description', menu.description)
    menu.price = data.get('price', menu.price)
    menu.category = data.get('category', menu.category)
    menu.image_url = data.get('image_url', menu.image_url)

    db.session.commit()
    return jsonify(menu.to_dict()), 200

# Delete a menu item - only owner can delete
@menu_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_menu(id):
    identity = get_jwt_identity()
    if identity["role"] != "owner":
        return jsonify({"error": "Only owners can delete menu items"}), 403

    menu = Menu.query.get(id)
    if not menu:
        return jsonify({"error": "Menu not found"}), 404

    if menu.restaurant.owner_id != identity["id"]:
        return jsonify({"error": "You are not authorized to delete this menu"}), 403

    db.session.delete(menu)
    db.session.commit()
    return jsonify({"message": "Menu item deleted"}), 200
