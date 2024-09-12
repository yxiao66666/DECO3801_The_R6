from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from search_engine_access import generate_image_caption, search_pinterest, response_pull_images
from PIL import Image
from werkzeug.utils import secure_filename
import os
from transformers import BlipProcessor, BlipForConditionalGeneration
from controlnet.sd_backbone import StableDiffusionBackBone



app = Flask(__name__)
CORS(app)

# add the model and processor to search_Pinterest???

bb = StableDiffusionBackBone()

blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')
blip = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')

# Configure upload folder and allowed extensions
UPLOAD_FOLDER = 'backend/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Only images allowed
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

# Upload image and text in upload.js
@app.route('/upload', methods=['POST'])
def upload_file():

    bb.reset()
    if request.method == 'POST':

        files = []
        options = []

        # Loop through the files and options
        files = _collect_imgs(request.files)
        
        # Process AI options
        for key in request.form:
            if 'option' in key:
                options.append(request.form[key])

        text = request.form.get('text', '')

        num_units = len(files)

        for i in range(num_units):
            img = files[i]
            module_option = options[i]
            bb.add_control_unit(unit_num=i, image_path=img, module=module_option)

        outputs = bb.txt2img(text)

        response = dict()

        for i in len(outputs):
            response[i] = outputs[i]

        return jsonify(response), 200
    else:
        return {}, 405
    
def _collect_imgs(files_requests):
        files = []
        for key in files_requests:
            if 'image' in key:
                file = request.files[key]
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(filepath)
                    files.append(filepath)
        return files

if __name__ == '__main__':

    app.run(host = 'localhost', debug = True)