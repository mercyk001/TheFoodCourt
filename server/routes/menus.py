from flask import Blueprint, request, jsonify
from models import db, Menu, Restaurant
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

menu_bp = Blueprint('menu', __name__, url_prefix='/menus')


# ✅ Return a flat list of all menu items with restaurant and cuisine info
@menu_bp.route('/', methods=['GET'])
def get_menus():
    restaurants = Restaurant.query.all()
    flat_dishes = []

    for r in restaurants:
        for m in r.menus:
            flat_dishes.append({
                "id": m.id,
                "name": m.name,
                "img": m.image_url,  # Match React naming
                "price": m.price,
                "category": m.category,
                "restaurant": r.name,
                "cuisine": r.cuisine
            })

    return jsonify(flat_dishes), 200


# ✅ Get a specific menu item
@menu_bp.route('/<int:id>', methods=['GET'])
def get_menu(id):
    menu = Menu.query.get(id)
    if not menu:
        return jsonify({"error": "Menu not found"}), 404
    return jsonify(menu.to_dict()), 200


# ✅ Create a new menu item (owner only)
@menu_bp.route('/', methods=['POST'])
@jwt_required()
def create_menu():
    identity = get_jwt_identity()
    if identity["role"] != "owner":
        return jsonify({"error": "Only owners can create menu items"}), 403

    data = request.get_json()

    required_fields = ['meal_id', 'restaurant_id', 'name', 'price', 'category']
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    restaurant = Restaurant.query.get(data['restaurant_id'])
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
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ✅ Update a menu item (owner only)
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


# ✅ Delete a menu item (owner only)
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


# 🔁 OPTIONAL: Get all menus for a specific restaurant
@menu_bp.route('/restaurant/<int:restaurant_id>', methods=['GET'])
def get_menus_by_restaurant(restaurant_id):
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404

    return jsonify({
        "id": restaurant.id,
        "name": restaurant.name,
        "cuisine": restaurant.cuisine,
        "menu": [menu.to_dict() for menu in restaurant.menus]
    }), 200
