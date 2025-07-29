from flask import Flask, request, jsonify, make_response
from flask_migrate import Migrate
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_jwt_extended import JWTManager
from models import db
from routes.orders import orders_bp
from routes.users import users_bp
from routes.menus import menu_bp 
from routes.reservations import reservations_bp 
from routes.restaurants import restaurants_bp
from routes.meals import meals_bp
from routes.tables import tables_bp
from routes.dashboard import dashboard_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///foodcourt.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_ACCESS_COOKIE_PATH"] = "/"
app.config["JWT_COOKIE_SECURE"] = False  # Set to True in production with HTTPS
app.config["JWT_COOKIE_CSRF_PROTECT"] = False  
app.config["JWT_COOKIE_SAMESITE"] = "Lax"

# Disable automatic trailing slash redirects to prevent CORS preflight issues
app.url_map.strict_slashes = False






db.init_app(app)
migrate = Migrate(app, db)

# Configure CORS with more explicit settings
CORS(app, 
         origins=['http://localhost:3000', 'http://localhost:5555'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'Cookie'],
         expose_headers=['Set-Cookie'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
         vary_header=False
    )

api = Api(app)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(users_bp)
app.register_blueprint(menu_bp)
app.register_blueprint(reservations_bp)
app.register_blueprint(restaurants_bp)
app.register_blueprint(meals_bp)
app.register_blueprint(tables_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

@app.route('/')
def index():
    return "Welcome to Food Court!"

# Add a test endpoint to verify CORS
@app.route('/test', methods=['GET', 'POST', 'OPTIONS'])
def test():
    return jsonify({"message": "CORS test successful", "method": request.method})

# Manual CORS preflight handler for all routes
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization,Cookie")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,PATCH,OPTIONS")
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

if __name__ == '__main__':
    app.run(debug=True, host ="0.0.0.0", port=5555)
