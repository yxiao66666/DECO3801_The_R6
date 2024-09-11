from flask import Flask, request
from flask_cors import CORS, cross_origin
from search_engine_access import search_pinterest, response_pull_images
from controlnet.util import cnet_txt2img
from PIL import Image
import os


app = Flask(__name__)
CORS(app)

@app.route('/search', methods = ['POST'])
@cross_origin()
def search():
    if request.method == 'POST':
        keyword = request.get_json().get('query')
        raw_imgs = search_pinterest(keyword)
        images = response_pull_images(raw_imgs)
        response = dict()
        for i in range(len(images)):
            response[i] = images[i]
        return response
    else:
        return {}
    
@app.route('/upload', methods = ['GET', 'POST'])
@cross_origin()
def upload():
    return request.form
    # if request.method == 'POST':

    #     prompt = request.form['prompt']
    #     reference = request.files['reference']

    #     path = os.path.join(app.root_path, 'images', reference.filename)

    #     reference.save(path)

    #     ref_img = Image.open(path)

    #     images = cnet_txt2img(prompt, ref_img)

    #     # This section is a compromise as behaviour is unpredictable
    #     return images

    # else:
    #     return render_template('generate.html')
if __name__ == '__main__':

    app.run(host = 'localhost', debug = True)