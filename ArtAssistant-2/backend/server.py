from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS # Enable Cross-Origin Resource Sharing (CORS) MUST HAVE OR ERROR

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable Cross-Origin Resource Sharing MUST HAVE OR ERROR
app.config['CORS_HEADERS'] = 'Content-Type'

# Configure upload folder and allowed extensions
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Only images allowed
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Upload image and text in upload.js
@app.route('/upload', methods=['POST'])
def upload_file():
    print("Form data received:")
    print(request.form)
    print("Files received:")
    print(request.files)

    files = []
    options = []

    # Loop through the files and options
    for key in request.files:
        file = request.files[key] 
        if 'image' in key and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            files.append(filepath)
        
        elif key=='canvasImage':
            filename = 'canvasImage.png' 
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            files.append(filepath)
        else:
            print(f"File {file.filename} is not a valid image format or is not handled.")

        

    
    # Process AI options
    for key in request.form:
        if 'option' in key:
            options.append(request.form[key])

    text = request.form.get('text', '')

    response = {
        "message": "Files successfully uploaded",
        "files": files,  # List of uploaded files
        "ai_options": options,  # Corresponding AI options for each image
        "text": text
    }
    print("This is Python: ", files)

    return jsonify(response), 200



@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    search_query = data.get('query', '')


    return jsonify({"search_query": search_query})





if __name__ == '__main__':
    app.run(debug=True, port=5000)


