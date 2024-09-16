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
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
# app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://ryuto:ryuto@localhost/ArtAssistant"

engine = create_engine("mysql+pymysql://ryuto:ryuto@localhost/ArtAssistant")

Base = declarative_base()

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
# db = SQLAlchemy(app)

class Users(Base):
    __tablename__ = 'Users'
    user_id = Column(Integer, primary_key = True)
    user_name = Column(String(255), unique = True)
    user_password = Column(String(255))
    created_at = Column(DateTime, default = datetime.now)

class SearchImage(Base):
    __tablename__ = 'SearchImage'
    s_image_id = Column(Integer, primary_key = True)
    user_id = Column(Integer, ForeignKey('Users.user_id'))
    s_image_file_path = Column(LONGTEXT)
    created_at = Column(DateTime, default = datetime.now)

class SearchText(Base):
    __tablename__ = 'SearchText'
    s_text_id = Column(Integer, primary_key = True)
    s_image_id = Column(Integer, ForeignKey('SearchImage.s_image_id'))
    s_text_query = Column(String(255))
    created_at = Column(DateTime, default = datetime.now)

class GenerateImage(Base):
    __tablename__ = 'GenerateImage'
    g_image_id = Column(Integer, primary_key = True)
    user_id = Column(Integer, ForeignKey('Users.user_id'))
    g_image_file_path = Column(LONGTEXT)
    created_at = Column(DateTime, default = datetime.now)

class GenerateText(Base):
    __tablename__ = 'GenerateText'
    g_text_id = Column(Integer, primary_key = True)
    g_image_id = Column(Integer, ForeignKey('GenerateImage.g_image_id'))
    g_text_query = Column(String(255))
    created_at = Column(DateTime, default = datetime.now)

class SavedImage(Base):
    __tablename__ = 'SavedImage'
    sd_image_id = Column(Integer, primary_key = True)
    user_id = Column(Integer, ForeignKey('Users.user_id'))
    sd_image_path = Column(LONGTEXT)
    created_at = Column(DateTime, default = datetime.now)

Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()
    
@app.route('/user', methods=['GET'])
def get_user():
    users = Users.query.all()
    print(users)
    return jsonify({'idk':'something'}), 200


@app.route('/users/add', methods=['POST'])
# @cross_origin
# Use this function to test the database?
def add_user():
    if request.method == 'POST':
        try:
            data = request.get_json()
            print('here')
            new_user = Users(user_name = data['user_name'],
                            user_password = data['user_password'])
            print('there')
            session.add(new_user)
            print('everywhere')
            print(new_user)
            session.commit()
            print('why')
            return jsonify({'id': new_user.user_id,
                            'user_name': new_user.user_name,
                            'user_password': new_user.user_password,
                            'created_at': new_user.created_at}), 201
        except Exception as e:
            return jsonify({'message': 'An error occured', 'error':str(e)}), 500
    return {}, 405

@app.route('/search', methods = ['POST'])
@cross_origin()
def search():
    '''
    Returns a list of images with the given image or keyword

    The endpoint accepts a JSON payload with the keyword in string or an image the user selects

    Returns:
        JSON response with the images associated with the users inputs
    '''
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

    app.run(host='localhost', debug=True)