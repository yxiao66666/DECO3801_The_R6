import io
import os
from PIL import Image
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

from search_engine_access import generate_image_caption, search_pinterest, response_pull_images
from transformers import BlipProcessor, BlipForConditionalGeneration

from controlnet.sd_backbone import StableDiffusionBackBone


app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

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
    
    return jsonify(response), 200


if __name__ == '__main__':

    app.run(host='localhost', debug=True)