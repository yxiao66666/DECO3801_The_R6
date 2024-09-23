"""
This file contains the API of the application. All methods handle requests and JSON files from the frontend and
 return response and a JSON file.
"""
import os
from datetime import datetime

from flask import Flask, request, jsonify, after_this_request
from flask_cors import CORS, cross_origin

from search_engine_access import generate_image_caption, search_pinterest, response_pull_images
from transformers import BlipProcessor, BlipForConditionalGeneration

from controlnet.sd_backbone import StableDiffusionBackBone

# Database
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.mysql import LONGTEXT

# Database
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.mysql import LONGTEXT

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://ryuto:ryuto@localhost/ArtAssistant'
# Folder to temporarily save generation results
GENERATION_FOLDER = './generations'
app.config['GENERATION_FOLDER'] = GENERATION_FOLDER
os.makedirs(GENERATION_FOLDER, exist_ok=True)

UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialising blip
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')
blip = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')

# Initialising sdbackbone
webui_url = 'http://127.0.0.1:7860' # TODO: Change the url to 
bb = StableDiffusionBackBone(webui_url)

# Creating Database
db = SQLAlchemy(app)

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
        user = Users.query.get(data['user_id'])
        work = SavedImage.query.get(data['user_id'])

        if user:
            return jsonify({
                'email': user.user_email, 
                'id': user.user_id,
                'works': work.sd_image_path,
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
        users = Users.query.all()
        users_list = [
        {
            "user_id": user.user_id,
            "user_email": user.user_email,
            "user_password": user.password,
            "created_at": user.created_at  # Convert datetime to string
        }
        for user in users
        ]
        return jsonify(users_list), 200
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
            user_email = data['user_email']

            # Check if the user already exists
            existing_user = Users.query.filter_by(user_email=user_email).first()
            if existing_user:
                return jsonify({'message': 'Email already exists'}), 400

            # Create new user
            new_user = Users(user_email=user_email,
                             user_password=data['user_password'])
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
            user_email = data['user_email']
            user_password = data['user_password']

            # Find the user by email
            user = Users.query.filter_by(user_email=user_email).first()
            if user and user.user_password == user_password:
                return jsonify({
                    'user_id': user.user_id,
                    'user_email': user.user_email,
                    'created_at': user.created_at
                }), 200  # Successful authentication
            else:
                return jsonify({'message': 'Invalid email or password'}), 401  # Unauthorized

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
            user = Users.query.get(user_id)
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
        search_image = SearchImage.query.get(data['s_image_id'])
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
        search_imgs = SearchImage.query.all()
        search_imgs_list = [
        {
            "s_image_id": search_img.s_image_id,
            "user_id": search_img.user_id,
            "s_image_file_path": search_img.s_image_file_path,
            "created_at": search_img.created_at  # Convert datetime to string
        }
        for search_img in search_imgs
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
            new_search_image = SearchImage(user_id = data['user_id'],
                                   s_image_file_path = data['s_image_file_path'])
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
        search_text = SearchText.query.get(data['s_text_id'])
        return jsonify({'SearchImage': search_text}), 201
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
        search_texts = SearchImage.query.all()
        search_texts_list = [
        {
            "s_text_id": search_text.s_text_id,
            "user_id": search_text.user_id,
            "s_text_query": search_text.s_text_query,
            "created_at": search_text.created_at  # Convert datetime to string
        }
        for search_text in search_texts
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
            new_search_text = SearchText(user_id = data['user_id'],
                                        s_text_query = data['s_text_query'])
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

class GenerateImage(db.Model):
    __tablename__ = 'GenerateImage'
    g_image_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete = 'CASCADE'))
    g_image_file_path = db.Column(LONGTEXT)
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
        data = request.get_json()
        generate_image = GenerateImage.query.get(data['g_image_id'])
        return jsonify({'SearchImage': generate_image}), 200
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
        generate_imgs = SearchImage.query.all()
        generate_imgs_list = [
        {
            "g_image_id": generate_img.g_image_id,
            "user_id": generate_img.user_id,
            "g_image_file_path": generate_img.g_image_file_path,
            "created_at": generate_img.created_at  # Convert datetime to string
        }
        for generate_img in generate_imgs
        ]
        return jsonify(generate_imgs_list), 200
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
            new_generate_image = GenerateImage(user_id = data['user_id'],
                                   g_image_file_path = data['g_image_file_path'])
            db.session.add(new_generate_image)
            db.session.commit()
            return jsonify({'g_image_id': new_generate_image.g_image_id,
                            'user_id': new_generate_image.user_id,
                            'g_image_file_path': new_generate_image.g_image_file_path,
                            'created_at': new_generate_image.created_at}), 201
        except Exception as e:
            db.session.rollback()
            return {'Exception Raised: ' : e}, 500
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
        generate_text = GenerateText.query.get(data['g_text_id'])
        return jsonify({'SearchImage': generate_text}), 200
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
        generate_texts = SearchImage.query.all()
        generate_texts_list = [
        {
            "g_text_id": generate_text.g_text_id,
            "user_id": generate_text.user_id,
            "g_text_query": generate_text.g_text_query,
            "created_at": generate_text.created_at  # Convert datetime to string
        }
        for generate_text in generate_texts
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
            new_generate_text = GenerateText(user_id = data['user_id'],
                                   g_text_query = data['g_text_query'])
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

@app.route('/backend/saved_image/get', methods = ['POST'])
@cross_origin()
def get_saved_img():
    '''
    Gets the saved image with the corresponding id

    Returns:
        JSON with infomation of the saved image with the corresponding id or
        None if the handed id does not exist
    '''
    if request.method == 'POST':
        data = request.get_json()
        saved_image = SavedImage.query.get(data['sd_image_id'])
        return jsonify({'SearchImage': saved_image}), 200
    return {}, 405

@app.route('/backend/saved_image/get/all', methods = ['GET'])
@cross_origin()
def get_saved_imgs():
    '''
    Gets all saved images

    Returns:
        JSON with all saved images
    '''
    if request.method == 'GET':
        saved_imgs = SearchImage.query.all()
        saved_imgs_list = [
        {
            "sd_image_id": saved_img.sd_image_id,
            "user_id": saved_img.user_id,
            "sd_image_path": saved_img.sd_image_path,
            "created_at": saved_img.created_at  # Convert datetime to string
        }
        for saved_img in saved_imgs
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
            new_saved_image = SavedImage(user_id = data['user_id'],
                                   sd_image_path = data['sd_image_path'])
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

@app.route('/backend/search', methods=['POST'])
@cross_origin()
def search():
    '''
    Retrieve data from the Pinterest API using the keyword or an image submitted by the user.
    
    If both a search query and an image are provided, combine the keyword and the image caption for a more refined search.

    Returns:
        Response: A JSON response with a unique id for each image.

    Requires:
        - the type of 'query' == String (optional)
        - the type of 'image' == Path to File (optional)
    '''
    if request.method == 'POST':
        try:
            print("Received POST request")
            
            # Ensure the upload folder exists
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])

            # Initialize variables for the final search query
            final_query = ""
            raw_imgs = []

            # Check if an image is uploaded
            if 'image' in request.files:
                image = request.files['image']
                if image.filename != '':
                    # Save the image
                    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
                    image.save(image_path)
                    print(f"Image saved at: {image_path}")
                    
                    # Generate caption from the image
                    caption = generate_image_caption(image_path=image_path, model=blip, processor=blip_processor)
                    print(f"Generated caption: {caption}")
                    final_query += caption  # Add the caption to the final query

            # Get the search text query (if provided)
            keyword = request.form.get('query', '').strip()
            if keyword:
                print(f"Search keyword: {keyword}")
                # If keyword exists, append it to the final query
                if final_query:
                    final_query += " " + keyword  # Combine both image caption and text
                else:
                    final_query = keyword  # Only the keyword if no image caption

            # If there is a query (either from image, keyword, or both), search
            if final_query:
                print(f"Final search query: {final_query}")
                raw_imgs = search_pinterest(final_query)
            else:
                return {'error': 'No search query or image provided'}, 400

            images = response_pull_images(raw_imgs)
            response = {i: images[i] for i in range(len(images))}
            return jsonify(response), 200

        except Exception as e:
            print(f"Error occurred: {e}")
            return {'error': str(e)}, 500

    return {}, 405


@app.route('/backend/upload', methods = ['POST'])
@cross_origin()
def upload():
    if request.method != 'POST':
        return {}, 405
    
    bb.reset()

    # Handle image files and associated options
    idx = 0
    while True:
        image_key = f'image{idx}'
        option_key = f'option{idx}'

        image_file = request.files.get(image_key)
        option_value = request.form.get(option_key)

        if image_file and option_value:
            bb.add_control_unit(
                unit_num=idx,
                image_path=image_file,
                module=option_value,
                # TODO: missing intensity
            )
        else:
            break

        idx += 1

    prompt = request.form.get('text')
    inpaint_image = request.files.get('canvasImage')
    # TODO: missing inpaint mask
    inpaint_mask = None
    # TODO: missing keep aspect ratio flag
    
    if inpaint_image and inpaint_mask:
        bb.add_inpaint_image(inpaint_image)
        bb.add_inpaint_mask(inpaint_mask)
        output = bb.img2img_inpaint(
            prompt=prompt,
            # TODO: missing keep aspect ratio flag
        )
    else:
        output = bb.txt2img(prompt=prompt)
    
    response = {}
    for idx, img in enumerate(output):
        file_name = f'{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}_{prompt}_{idx}.png'
        file_path = os.path.join(app.config['GENERATION_FOLDER'], file_name)
        img.save(file_path, format='PNG')
        
        response[idx] = file_name
    
    @after_this_request
    def delete_generations(r):
        '''delete generated images after they got sent back'''
        for file in response.values():
            file_path = os.path.join(app.config['GENERATION_FOLDER'], file)
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error deleting file {file}: {e}")
        return r
    
    return jsonify(response), 200


if __name__ == '__main__':

    with app.app_context():
        db.create_all()

    with app.app_context():
        db.create_all()

        app.run(host='localhost', debug=True)
        app.run(host='localhost', debug=True)
