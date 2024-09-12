from flask import Flask, request
from flask_cors import CORS, cross_origin
from search_engine_access import generate_image_caption, search_pinterest, response_pull_images
from PIL import Image
import os
from transformers import BlipProcessor, BlipForConditionalGeneration
from controlnet.sd_backbone import StableDiffusionBackBone



app = Flask(__name__)
CORS(app)

# add the model and processor to search_Pinterest???

sdbb = StableDiffusionBackBone()

blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')
blip = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')

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
        return response
    else:
        return {}
    
@app.route('/upload', methods = ['POST'])
@cross_origin()
def upload():
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
        return response
    else:
        return {}

if __name__ == '__main__':

    app.run(host = 'localhost', debug = True)