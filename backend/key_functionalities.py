from flask import Blueprint, current_app, jsonify, request
from datetime import datetime
from flask_cors import cross_origin
import os
import glob
from search_engine_access import generate_image_caption, search_pinterest, response_pull_images

from app import blip, blip_processor, bb

bp = Blueprint('key_functionalities', __name__)

@bp.route('/backend/search', methods=['POST'])
@cross_origin()
def search():
    '''
    Retrieve data from the Pinterest API using the keyword or an image submitted by the user.
    
    If both a search query and an image are provided, combine the keyword and the image caption for a more refined search.

    Returns:
        Response: A JSON response with a unique id for each image. The function returns 100 images.

    Requires:
        - the type of 'query' == String (optional)
        - the type of 'image' == Path to File (optional)
    '''
    if request.method == 'POST':
        try:
            print("Received POST request")
            
            # Ensure the upload folder exists
            if not os.path.exists(current_app.config['UPLOAD_FOLDER']):
                os.makedirs(current_app.config['UPLOAD_FOLDER'])

            # Initialize variables for the final search query
            final_query = ""
            raw_imgs = []

            # Check if an image is uploaded
            if 'image' in request.files:
                image = request.files['image']
                if image.filename != '':
                    # Save the image
                    image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image.filename)
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
                # If keyword exists, current_append it to the final query
                if final_query:
                    final_query += " " + keyword  # Combine both image caption and text
                else:
                    final_query = keyword  # Only the keyword if no image caption

            # If there is a query (either from image, keyword, or both), search
            if final_query:
                print(f"Final search query: {final_query}")
                raw_imgs = search_pinterest(query = final_query, options = {'"page_size"': "100"} )
            else:
                return {'error': 'No search query or image provided'}, 400

            images = response_pull_images(raw_imgs)
            response = {i: images[i] for i in range(len(images))}
            return jsonify(response), 200

        except Exception as e:
            print(f"Error occurred: {e}")
            return {'error': str(e)}, 500

    return {}, 405


# Store filenames for cleanup
image_files = []

@bp.route('/backend/upload', methods=['POST'])
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
        intensity_key = f'intensity{idx}'

        image_file = request.files.get(image_key)
        option_value = request.form.get(option_key)
        intensity_value = request.form.get(intensity_key, 1.0)  # Default intensity if not provided

        print('DEEZNUTS', option_value)
        if image_file and option_value:
            module_value, intensity_value = option_value.split('|')
            bb.add_control_unit(
                unit_num=idx,
                image_path=image_file,
                module=module_value,
                intensity=intensity_value
            )
        else:
            break

        idx += 1

    prompt = request.form.get('text')
    inpaint_image = request.files.get('canvasImage')
    inpaint_mask = request.files.get('maskImage')
    keep_aspect_ratio = request.form.get('keep_aspect_ratio', 'true') == 'true'

    # Initialize output to prevent UnboundLocalError
    output = None

    # Process inpaint or text-to-image
    if inpaint_image and inpaint_mask:
        bb.add_inpaint_image(inpaint_image)
        bb.add_inpaint_mask(inpaint_mask)
        output = bb.img2img_inpaint(
            prompt=prompt,
            keep_aspect_ratio=keep_aspect_ratio
        )
    else:
        try:
            output = bb.txt2img(prompt=prompt)
            print(f"Direct test output: {output}")

            # Check if output is None or not a list of images
            if not output:
                print("txt2img returned an empty result.")
                return jsonify({'error': 'Image generation returned no results.'}), 500
            if not isinstance(output, list):
                output = [output]  # Ensure it's treated as a list of images

            print(f"Output from txt2img: {output}")
        except KeyError as ke:
            print(f"Error during direct txt2img test: {ke}")
            return jsonify({'error': 'Failed to generate image, key error occurred.'}), 500
        except Exception as e:
            print(f"Error during txt2img generation: {e}")
            return jsonify({'error': 'Failed to generate image.'}), 500

    # Save and respond with output images
    response = {}
    for idx, img in enumerate(output):
        file_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}_{prompt.replace(' ', '_')}_{idx}.png"
        file_path = os.path.join(current_app.config['GENERATION_FOLDER'], file_name)
        img.save(file_path, format='PNG')
        
        #print(f"Image saved at: {file_path}")
        response[idx] = file_name

    return jsonify(response), 200

@current_app.route('/backend/cleanup', methods=['DELETE'])
def cleanup_images():
    # Define the path to the generations folder
    generation_folder = current_app.config['GENERATION_FOLDER']

    # Use glob to find all image files in the folder
    image_files = glob.glob(os.path.join(generation_folder, '*'))

    for file_path in image_files:
        if os.path.isfile(file_path):  # Check if it's a file
            try:
                os.remove(file_path)
                print(f"Deleted file: {file_path}")
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")

    return jsonify({'message': 'Cleanup successful'}), 200