from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS # Enable Cross-Origin Resource Sharing (CORS) MUST HAVE OR ERROR

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing MUST HAVE OR ERROR

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

    if 'image' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['image']
    text = request.form.get('text', '')

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        response = {
            "message": "File successfully uploaded",
            "file_path": filepath,
            "text": text
        }
        return jsonify(response), 200
    else:
        return jsonify({"error": "Invalid file format"}), 400




@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    search_query = data.get('query', '')

    return jsonify({"search_query": search_query})





















if __name__ == '__main__':
    app.run(debug=True, port=5000)
