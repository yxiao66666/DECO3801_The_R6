from flask import Flask, render_template, request
from flask_cors import CORS
from search_engine_access import search_pinterest, response_pull_images
from controlnet.util import cnet_txt2img
from PIL import Image
import os


app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/search', methods = ['GET', 'POST'])
def search():
    if request.method == 'POST':
        keyword = request.form['search']
        raw_imgs = search_pinterest(keyword)
        images = response_pull_images(raw_imgs)
        return render_template('search_results.html', images = images)
    else:
        return render_template('search.html')
    
@app.route('/generation', methods = ['GET', 'POST'])
def generate():
    if request.method == 'POST':

        prompt = request.form['prompt']
        reference = request.files['reference']

        path = os.path.join(app.root_path, 'images', reference.filename)

        reference.save(path)

        ref_img = Image.open(path)

        images = cnet_txt2img(prompt, ref_img)

        # This section is a compromise as behaviour is unpredictable
        return images

    else:
        return render_template('generate.html')
if __name__ == '__main__':

    app.run(host = 'localhost', debug = True)