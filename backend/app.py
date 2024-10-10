"""
This file contains the API of the application. All methods handle requests and JSON files from the frontend and
 return response and a JSON file.
"""
import os
from datetime import datetime

from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

# Database
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.mysql import LONGTEXT

from transformers import BlipProcessor, BlipForConditionalGeneration

from controlnet.sd_backbone import StableDiffusionBackBone

app = Flask(__name__, static_folder='static')
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'default_secret_key')  # Use an environment variable your_random_secret_key

load_dotenv()

DB_LINK = os.getenv('DB_LINK')

CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_DATABASE_URI'] = DB_LINK
# Folder to temporarily save generation results
GENERATION_FOLDER = os.path.join('static', 'generations')
app.config['GENERATION_FOLDER'] = GENERATION_FOLDER

# Make sure the folder exists
if not os.path.exists(app.config['GENERATION_FOLDER']):
    os.makedirs(GENERATION_FOLDER, exist_ok=True)

UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialising blip
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')
blip = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')

# Initialising sdbackbone
webui_url = 'https://civil-tahr-stirring.ngrok-free.app'
bb = StableDiffusionBackBone(webui_url)

# Creating Database
db = SQLAlchemy(app)

import hashlib

def hash_password(password):
   password_bytes = password.encode('utf-8')
   hash_object = hashlib.sha256(password_bytes)
   return hash_object.hexdigest()

# temporarily user_name is replaced with user_email
class Users(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key = True)
    user_email = db.Column(db.String(255), unique = True)
    user_password = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default = datetime.now)

    s_images = db.relationship('SearchImage', backref='users', cascade='all, delete-orphan')
    s_text = db.relationship('SearchText', backref='users',cascade='all, delete-orphan')
    g_images = db.relationship('GenerateImage', backref='users', cascade='all, delete-orphan')
    g_text = db.relationship('GenerateText', backref='users', cascade='all, delete-orphan')
    sd_images = db.relationship('SavedImage', backref='users', cascade='all, delete-orphan')

@app.route('/backend/users/get', methods=['POST'])
@cross_origin()
def get_user():
    '''
    Gets the user with the corresponding id

    Returns:
        JSON with information of the user with the corresponding id or
        None if the handed id does not exist
    '''
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')
        user = db.session.get(Users, user_id)

        if user:
            return jsonify({
                'email': user.user_email, 
                'id': user.user_id
            }), 200
        
        return jsonify({'error': 'User not found'}), 404
    return {}, 405

@app.route('/backend/users/get/all', methods = ['GET'])
@cross_origin()
def get_users():
    '''
    Gets all users

    Returns:
        JSON with all users
    '''
    if request.method == 'GET':
        users = db.session.query(Users).all()
        users_list = [
        {
            "user_id": user.user_id,
            "user_email": user.user_email,
            "user_password": user.user_password,
            "created_at": user.created_at  # Convert datetime to string
        }
        for user in users
        ]
        return jsonify(users_list), 200
    return {}, 405

@app.route('/backend/users/get_id', methods=['POST'])
@cross_origin()
def display_user():
    '''
    Gets the user ID based on the provided email.

    Returns:
        JSON with the user ID or an error message if not found.
    '''
    if request.method == 'POST':
        data = request.get_json()
        user_email = data.get('email')

        user = db.session.query(Users).filter_by(user_email = user_email).first()

        if user:
            return jsonify({'user_id': user.user_id}), 200
        
        return jsonify({'error': 'User not found'}), 404
        
    return {}, 405



@app.route('/backend/users/insert', methods=['POST'])
@cross_origin()
def insert_user():
    '''
    Inserts the new user to the database if the email does not already exist.

    Returns:
        The corresponding response to the outcome of query
    '''
    if request.method == 'POST':
        try:
            data = request.get_json()
            user_email = data.get('user_email')
            user_password = hash_password(data.get('user_password'))

            # Check if the user already exists
            existing_user = db.session.query(Users).filter_by(user_email = user_email).first()
            if existing_user:
                return jsonify({'message': 'Email already exists'}), 400

            # Create new user
            new_user = Users(user_email=user_email,
                             user_password=user_password)
            db.session.add(new_user)
            db.session.commit()
            return jsonify({'user_id': new_user.user_id,
                            'user_email': new_user.user_email,
                            'created_at': new_user.created_at}), 201
        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ': str(e)}, 500
    return {}, 405

@app.route('/backend/users/authenticate', methods=['POST'])
@cross_origin()
def authenticate_user():
    '''
    Authenticates the user by checking the email and password against the database.

    Returns:
        The corresponding response to the outcome of query
    '''
    if request.method == 'POST':
        try:
            data = request.get_json()
            user_email = data.get('user_email')
            user_password = hash_password(data.get('user_password'))

            # Find the user by email
            user = db.session.query(Users).filter_by(user_email = user_email).first()
            if user and user.user_password == user_password:
                return jsonify({
                    'user_id': user.user_id,
                    'user_email': user.user_email,
                    'created_at': user.created_at
                }), 200  # Successful authentication
            else:
                return jsonify({'message': 'Invalid email or password'}), 401  # Unauthorised

        except Exception as e:
            return {'Exception Raised: ': str(e)}, 500
    return {}, 405

@app.route('/backend/users/delete', methods = ['POST'])
@cross_origin()
def delete_user():
    '''
    Deletes the user with corresponding id from the database

    Returns:
        The corresponding response to the outcome of query
    '''
    if request.method == 'POST':
        try:
            data = request.get_json()
            user_id = data.get('user_id')
            user = db.session.get(Users, user_id)
            db.session.delete(user)
            db.session.commit()
            return jsonify({'DELETED' : user_id}), 201
        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ' : e}, 500
    return {}, 405

class SearchImage(db.Model):
    __tablename__ = 'SearchImage'
    s_image_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete = 'CASCADE'))
    s_image_file_path = db.Column(LONGTEXT)
    created_at = db.Column(db.DateTime, default = datetime.now)

@app.route('/backend/search_image/get', methods = ['POST'])
@cross_origin()
def get_search_img():
    '''
    Gets the searched image with the corresponding id

    Returns:
        JSON with infomation of the searched image with the corresponding id or
        None if the handed id does not exist
    '''
    if request.method == 'POST':
        data = request.get_json()
        s_img_id = data.get('s_image_id')
        search_image = db.session.get(SearchImage, s_img_id)
        return jsonify({'SearchImage': search_image}), 200
    return {}, 405

@app.route('/backend/search_image/get/all', methods = ['GET'])
@cross_origin()
def get_search_imgs():
    '''
    Gets all searched images

    Returns:
        JSON with all searched images
    '''
    if request.method == 'GET':
        search_imgs = db.session.query(SearchImage).all()
        search_imgs_list = [
        {
            "s_image_id": s.s_image_id,
            "user_id": s.user_id,
            "s_image_file_path": s.s_image_file_path,
            "created_at": s.created_at  # Convert datetime to string
        }
        for s in search_imgs
        ]
        return jsonify(search_imgs_list), 200
    return {}, 405
    
@app.route('/backend/search_image/insert', methods=['POST'])
@cross_origin()
def insert_search_image():
    '''
    Inserts the new search image to the database

    IMPORTANT:
        The endpoint assumes that it will be handed with a user_id

    Returns:
        The corresponding response to the outcome of query
    '''
    if request.method == 'POST':
        try:
            data = request.get_json()
            user_id = data.get('user_id')
            s_image_file_path = data.get('s_image_file_path')
            new_search_image = SearchImage(user_id = user_id,
                                   s_image_file_path = s_image_file_path)
            db.session.add(new_search_image)
            db.session.commit()
            return jsonify({'s_image_id': new_search_image.s_image_id,
                            'user_id': new_search_image.user_id,
                            's_image_file_path': new_search_image.s_image_file_path,
                            'created_at': new_search_image.created_at}), 201
        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ' : e}, 500
    return {}, 405

class SearchText(db.Model):
    __tablename__ = 'SearchText'
    s_text_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete = 'CASCADE'))
    s_text_query = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default = datetime.now)

@app.route('/backend/search_text/get', methods = ['POST'])
@cross_origin()
def get_search_text():
    '''
    Gets the text used to search images with the corresponding id

    Returns:
        JSON with infomation of the text used to search with the corresponding id or
        None if the handed id does not exist
    '''
    if request.method == 'POST':
        data = request.get_json()
        s_text_id = data.get('s_text_id')
        search_text = db.session.get(SearchText, s_text_id)
        return jsonify({'SearchText': search_text}), 201
    return {}, 405

@app.route('/backend/search_text/get/all', methods = ['GET'])
@cross_origin()
def get_search_texts():
    '''
    Gets all texts used to search images

    Returns:
        JSON with all texts used for search
    '''
    if request.method == 'GET':
        search_texts = db.session.query(SearchText).all()
        search_texts_list = [
        {
            "s_text_id": s.s_text_id,
            "user_id": s.user_id,
            "s_text_query": s.s_text_query,
            "created_at": s.created_at  # Convert datetime to string
        }
        for s in search_texts
        ]
        return jsonify(search_texts_list), 200
    return {}, 405
    
@app.route('/backend/search_text/insert', methods=['POST'])
@cross_origin()
def insert_search_text():
    '''
    Inserts the new text used to search images to the database

    IMPORTANT:
        The endpoint assumes that it will be handed with user_id

    Returns:
        The corresponding response to the outcome of query
    '''

    if request.method == 'POST':
        try:
            data = request.get_json()
            user_id = data.get('user_id')
            s_text_query = data.get('s_text_query')
            new_search_text = SearchText(user_id = user_id,
                                        s_text_query = s_text_query)
            db.session.add(new_search_text)
            db.session.commit()
            return jsonify({'s_text_id': new_search_text.s_text_id,
                            'user_id': new_search_text.user_id,
                            's_text_query': new_search_text.s_text_query,
                            'created_at': new_search_text.created_at}), 201
        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ' : e}, 500
    return {}, 405

@app.route('/backend/search_text/get/user', methods=['POST'])
@cross_origin()
def get_search_text_for_user():    
    if request.method == 'POST': 
        data = request.get_json()
        user_id = data.get('user_id')
        
        if user_id is None:
            return {'error': 'user_id is required'}, 400

        search_text = db.session.query(SearchText).filter_by(user_id = user_id).all()
        search_text_list = [
            {
                "s_text_id": s.s_text_id, 
                "user_id": s.user_id,
                "s_text_query": s.s_text_query,
                "created_at": s.created_at.strftime('%Y-%m-%d %H:%M:%S')  # Convert datetime to string
            }
            for s in search_text
        ]
        return jsonify(search_text_list), 200
    return {}, 405

@app.route('/backend/search_text/delete', methods=['DELETE'])
@cross_origin()
def delete_search_text():
    '''
    Deletes the search history from the database

    IMPORTANT:
        The endpoint assumes that it will be handed with a user_id and s_text_query.
    '''
    if request.method == 'DELETE':
        try:
            data = request.get_json()
            user_id = data.get('user_id')
            s_text_query = data.get('s_text_query')

            # Query to find the search history
            saved_history = db.session.query(SearchText).filter(SearchText.user_id == user_id,
                                                               SearchText.s_text_query == s_text_query).first()
            if saved_history:
                db.session.delete(saved_history)
                db.session.commit()
                return jsonify({'message': 'History deleted successfully'}), 200
            else:
                return jsonify({'message': 'History not found'}), 404

        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ': str(e)}, 500
    return {}, 405

class GenerateImage(db.Model):
    __tablename__ = 'GenerateImage'
    g_image_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete = 'CASCADE'))
    g_image_path = db.Column(LONGTEXT)
    created_at = db.Column(db.DateTime, default = datetime.now)

@app.route('/backend/generate_image/get', methods = ['POST'])
@cross_origin()
def get_generate_img():
    '''
    Gets the generated image with the corresponding id

    Returns:
        JSON with infomation of the generated image used to search with the corresponding id or
        None if the handed id does not exist
    '''
    if request.method == 'POST':
        try:
            data = request.get_json()
            g_image_id = data.get('g_image_id')
            generate_image = db.session.get(GenerateImage, g_image_id)
            return jsonify({'GenerateImage': generate_image}), 200
        except Exception as e:
            return {'Exception Raised: ': str(e)}, 500
    return {}, 405

@app.route('/backend/generate_image/get/all', methods = ['GET'])
@cross_origin()
def get_generate_imgs():
    '''
    Gets all generated images

    Returns:
        JSON with all generated images
    '''
    if request.method == 'GET':
        generate_imgs = db.session.query(GenerateImage).all()
        generate_imgs_list = [
        {
            "g_image_id": g.g_image_id,
            "user_id": g.user_id,
            "g_image_path": g.g_image_path,
            "created_at": g.created_at
        }
        for g in generate_imgs
        ]
        return jsonify(generate_imgs_list), 200
    return {}, 405

@app.route('/backend/generate_image/get/user', methods=['POST'])
@cross_origin()
def get_generated_imgs_for_user():
    '''
    Gets all generated images for a specific user

    Returns:
        JSON with all generated images for the specified user
    '''
    if request.method == 'POST':
        try:
            data = request.get_json()
            user_id = data.get('user_id')

            if user_id is None:
                return {'error': 'user_id is required'}, 400
            
            generated_imgs = db.session.query(GenerateImage).filter_by(user_id = user_id).all()

            generated_imgs_list = [
                {
                    "g_image_id": g.g_image_id,
                    "user_id": g.user_id,
                    "g_image_path": g.g_image_path,
                    "created_at": g.created_at.strftime('%Y-%m-%d %H:%M:%S')  # Convert datetime to string
                }
                for g in generated_imgs
            ]
            return jsonify(generated_imgs_list), 200
        except Exception as e:
            print('Exception Raised: ', e)
            return {'Exception Raised: ': str(e)}, 500
    return {}, 405

@app.route('/backend/generate_image/insert', methods=['POST'])
@cross_origin()
def insert_generate_image():
    '''
    Inserts the new generated image to the database

    IMPORTANT:
        The endpoint assumes that it will be handed with a user_id

    Returns:
        The corresponding response to the outcome of query
    '''
    if request.method == 'POST':
        try:
            data = request.get_json()
            user_id = data.get('user_id')
            g_image_path = data.get('g_iamge_path')
            new_generate_image = GenerateImage(user_id = user_id,
                                   g_image_path = g_image_path)
            db.session.add(new_generate_image)
            db.session.commit()
            return jsonify({'g_image_id': new_generate_image.g_image_id,
                            'user_id': new_generate_image.user_id,
                            'g_image_path': new_generate_image.g_image_path,
                            'created_at': new_generate_image.created_at}), 201
        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ' : e}, 500
    return {}, 405

@app.route('/backend/generate_image/delete', methods=['DELETE'])
@cross_origin()
def delete_generate_image():
    '''
    Deletes the generated image from the database

    IMPORTANT:
        The endpoint assumes that it will be handed with a user_id and g_image_path.
    '''
    if request.method == 'DELETE':
        try:
            data = request.get_json()
            user_id = data.get('user_id')
            g_image_path = data.get('g_image_path')

            # Query to find the saved image
            generated_image = db.session.query(GenerateImage).filter(GenerateImage.user_id == user_id,
                                                                      GenerateImage.g_image_path == g_image_path).first()
            if generated_image:
                db.session.delete(generated_image)
                db.session.commit()
                return jsonify({'message': 'Image deleted successfully'}), 200
            else:
                return jsonify({'message': 'Image not found'}), 404

        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ': str(e)}, 500
    return {}, 405

class GenerateText(db.Model):
    __tablename__ = 'GenerateText'
    g_text_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete = 'CASCADE'))
    g_text_query = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default = datetime.now)

@app.route('/backend/generate_text/get', methods = ['POST'])
@cross_origin()
def get_generate_text():
    '''
    Gets the text used for image generation with the corresponding id

    Returns:
        JSON with infomation of the text used for image generation with the corresponding id or
        None if the handed id does not exist
    '''
    if request.method == 'POST':
        data = request.get_json()
        g_text_id = data.get('g_text_id')
        generate_text = db.session.get(GenerateText, g_text_id)
        return jsonify({'GenerateText': generate_text}), 200
    return {}, 405

@app.route('/backend/generate_text/get/all', methods = ['GET'])
@cross_origin()
def get_generate_texts():
    '''
    Gets all prompts used to generate images

    Returns:
        JSON with all texts used to generate images

    '''
    if request.method == 'GET':
        generate_texts = db.session.query(GenerateText).all()
        generate_texts_list = [
        {
            "g_text_id": g.g_text_id,
            "user_id": g.user_id,
            "g_text_query": g.g_text_query,
            "created_at": g.created_at  # Convert datetime to string
        }
        for g in generate_texts
        ]
        return jsonify(generate_texts_list), 200
    return {}, 405
    
@app.route('/backend/generate_text/insert', methods=['POST'])
@cross_origin()
def insert_generate_text():
    '''
    Inserts the new text used to generate images to the database

    IMPORTANT:
        The endpoint assumes that it will be handed with a user_id

    Returns:
        The corresponding response to the outcome of query
    '''
    if request.method == 'POST':
        try:
            data = request.get_json()
            user_id = data.get('user_id')
            g_text_query = data.get('g_text_query')
            new_generate_text = GenerateText(user_id = user_id,
                                   g_text_query = g_text_query)
            db.session.add(new_generate_text)
            db.session.commit()
            return jsonify({'g_text_id': new_generate_text.g_text_id,
                            'user_id': new_generate_text.user_id,
                            'g_text_query': new_generate_text.g_text_query,
                            'created_at': new_generate_text.created_at}), 201
        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ' : e}, 500
    return {}, 405

class SavedImage(db.Model):
    __tablename__ = 'SavedImage'
    sd_image_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete = 'CASCADE'))
    sd_image_path = db.Column(LONGTEXT)
    created_at = db.Column(db.DateTime, default = datetime.now)

@app.route('/backend/saved_image/get/all', methods = ['GET'])
@cross_origin()
def get_saved_imgs():
    '''
    Gets all saved images

    Returns:
        JSON with all saved images
    '''
    if request.method == 'GET':
        saved_imgs = db.session.query(SavedImage).all()
        saved_imgs_list = [
        {
            "sd_image_id": s.sd_image_id,
            "user_id": s.user_id,
            "sd_image_path": s.sd_image_path,
            "created_at": s.created_at  # Convert datetime to string
        }
        for s in saved_imgs
        ]
        return jsonify(saved_imgs_list), 200
    return {}, 405

@app.route('/backend/saved_image/insert', methods=['POST'])
@cross_origin()
def insert_saved_image():
    '''
    Inserts the new saved image to the database

    IMPORTANT:
        The endpoint assumes that it will be handed with a user_id. IT DOES NOT FETCH 
    '''
    if request.method == 'POST':
        try:
            data = request.get_json()
            user_id = data.get('user_id')
            sd_image_path = data.get('sd_image_path')
            new_saved_image = SavedImage(user_id = user_id,
                                   sd_image_path = sd_image_path)
            db.session.add(new_saved_image)
            db.session.commit()
            return jsonify({'sd_image_id': new_saved_image.sd_image_id,
                            'user_id': new_saved_image.user_id,
                            'sd_image_path': new_saved_image.sd_image_path,
                            'created_at': new_saved_image.created_at}), 201
        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ' : e}, 500
    return {}, 405

@app.route('/backend/saved_image/delete', methods=['DELETE'])
@cross_origin()
def delete_saved_image():
    '''
    Deletes the saved image from the database

    IMPORTANT:
        The endpoint assumes that it will be handed with a user_id and sd_image_path.
    '''
    if request.method == 'DELETE':
        try:
            data = request.get_json()
            user_id = data.get('user_id')
            sd_image_path = data.get('sd_image_path')

            # Query to find the saved image
            saved_image = db.session.query(SavedImage).filter(SavedImage.user_id == user_id,
                                                               SavedImage.sd_image_path == sd_image_path).first()
            if saved_image:
                db.session.delete(saved_image)
                db.session.commit()
                return jsonify({'message': 'Image deleted successfully'}), 200
            else:
                return jsonify({'message': 'Image not found'}), 404

        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ': str(e)}, 500
    return {}, 405

@app.route('/backend/saved_image/get/user', methods=['POST'])
@cross_origin()
def get_saved_imgs_for_user():
    '''
    Gets all saved images for a specific user

    Returns:
        JSON with all saved images for the specified user
    '''
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')
        
        if user_id is None:
            return {'error': 'user_id is required'}, 400

        saved_imgs = db.session.query(SavedImage).filter_by(user_id = user_id).all()

        saved_imgs_list = [
            {
                "sd_image_id": s.sd_image_id,
                "user_id": s.user_id,
                "sd_image_path": s.sd_image_path,
                "created_at": s.created_at.strftime('%Y-%m-%d %H:%M:%S')  # Convert datetime to string
            }
            for s in saved_imgs
        ]

        return jsonify(saved_imgs_list), 200
    return {}, 405

@app.route('/backend/saved_image/get', methods=['POST'])
@cross_origin()
def get_saved_img():
    '''
    Gets the saved image with the corresponding id

    Returns:
        JSON with information of the saved image with the corresponding id or
        None if the handed id does not exist
    '''
    if request.method == 'POST':
        data = request.get_json()
        sd_image_id = data.get('sd_image_id')
        saved_image = db.session.get(SavedImage, sd_image_id)
        if saved_image:
            return jsonify({'SavedImage': saved_image}), 200
        return {'error': 'Image not found'}, 404
    return {}, 405

if __name__ == '__main__':

    with app.app_context():

        import key_functionalities
        app.register_blueprint(key_functionalities.bp)

        # db.create_all()
        app.run(host='127.0.0.1', debug=True)
