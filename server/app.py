from flask import Flask, request, jsonify, make_response
from flask_migrate import Migrate
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_jwt_extended import JWTManager
from models import db
from routes.users import users_bp  # Import blueprint

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///foodcourt.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"

db.init_app(app)
migrate = Migrate(app, db)
CORS(app)
api = Api(app)
jwt = JWTManager(app)

#  Register the users blueprint
app.register_blueprint(users_bp)

@app.route('/')
def index():
    return "Welcome to Food Court!"

if __name__ == '__main__':
    app.run(debug=True, port=5555)
