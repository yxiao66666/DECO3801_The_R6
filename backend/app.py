import io
import os
from PIL import Image
from datetime import datetime

from flask import Flask, request, jsonify, after_this_request
from flask_cors import CORS, cross_origin

from search_engine_access import generate_image_caption, search_pinterest, response_pull_images
from transformers import BlipProcessor, BlipForConditionalGeneration

from controlnet.sd_backbone import StableDiffusionBackBone

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

# Initialising blip
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')
blip = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')

# Initialising sdbackbone
webui_url = 'http://127.0.0.1:7860'
bb = StableDiffusionBackBone(webui_url)

# Creating Database
db = SQLAlchemy(app)

# temporarily user_name is replaced with user_email
class Users(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    user_email = db.Column(db.String(255), unique = True)
    user_password = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default = datetime.now)

    def __init__(self, user_email, user_password):
        self.user_email = user_email
        self.user_password = user_password

class SearchImage(db.Model):
    __tablename__ = 'SearchImage'
    s_image_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'))
    s_image_file_path = db.Column(LONGTEXT)
    created_at = db.Column(db.DateTime, default = datetime.now)

class SearchText(db.Model):
    __tablename__ = 'SearchText'
    s_text_id = db.Column(db.Integer, primary_key = True)
    s_image_id = db.Column(db.Integer, db.ForeignKey('SearchImage.s_image_id'))
    s_text_query = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default = datetime.now)

class GenerateImage(db.Model):
    __tablename__ = 'GenerateImage'
    g_image_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'))
    g_image_file_path = db.Column(LONGTEXT)
    created_at = db.Column(db.DateTime, default = datetime.now)

class GenerateText(db.Model):
    __tablename__ = 'GenerateText'
    g_text_id = db.Column(db.Integer, primary_key = True)
    g_image_id = db.Column(db.Integer, db.ForeignKey('GenerateImage.g_image_id'))
    g_text_query = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default = datetime.now)

class SavedImage(db.Model):
    __tablename__ = 'SavedImage'
    sd_image_id = db.Column(db.Integer, primary_key = True, nullable = False)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'))
    sd_image_path = db.Column(LONGTEXT)
    created_at = db.Column(db.DateTime, default = datetime.now)

@app.route('/users/get', methods = ['GET'])
def get_user():
    print(request.method)
    if request.method == 'GET':
        users = Users.query.all()
        users_list = [
        {
            "user_id": user.user_id,
            "user_name": user.user_email,
            "created_at": user.created_at.isoformat()  # Convert datetime to string
        }
        for user in users
        ]
        return jsonify(users_list)

@app.route('/users/add', methods=['POST'])
# @cross_origin
# Use this function to test the database?
def add_user():
    if request.method == 'POST':
        try:
            data = request.get_json()
            new_user = Users(user_email = data['user_email'],
                            user_password = data['user_password'])
            db.session.add(new_user)
            db.session.commit()
            return jsonify({'user_id': new_user.user_id,
                            'user_email': new_user.user_email,
                            'user_password': new_user.user_password,
                            'created_at': new_user.created_at}), 201
        except Exception as e:
            db.session.rollback()
            return {}, 500
    return {}, 405

@app.route('/search', methods = ['POST'])
@cross_origin()
def search():
    if request.method == 'POST':
        if 'query' in request.get_json():
            keyword = request.get_json().get('query')
            raw_imgs = search_pinterest(keyword)
        else:
            source_img = request.get_json('image')
            caption = generate_image_caption(image_path=source_img, model=blip, processor=blip_processor)
            raw_imgs = search_pinterest(caption)

        images = response_pull_images(raw_imgs)
        response = dict()
        for i in range(len(images)):
            response[i] = images[i]
        return jsonify(response), 200
    else:
        return {}, 405

@app.route('/upload', methods = ['POST'])
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

        app.run(host='localhost', debug=True)