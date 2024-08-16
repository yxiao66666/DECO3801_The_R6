import io
import base64
import requests

from PIL import Image


cnet_modules = {
    'canny': 'control_v11p_sd15_canny [d14c016b]',  # general purpose
    'lineart_anime': 'control_v11p_sd15s2_lineart_anime [3825e83e]',     # line art
    'shuffle': 'control_v11e_sd15_shuffle [526bfdae]',  # transfer color scheme
    'mlsd': 'control_v11p_sd15_mlsd [aca30ff0]'     # straight lines
}


def decode_base64_to_image(encoding):
    if encoding.startswith('data:image/'):
        encoding = encoding.split(':')[1].split(',')[1]
    image = Image.open(io.BytesIO(base64.b64decode(encoding)))
    return image


def encode_pil_to_base64(image):
    with io.BytesIO() as output_bytes:
        image.save(output_bytes, format='PNG')
        bytes_data = output_bytes.getvalue()
    return base64.b64encode(bytes_data).decode('utf-8')


def cnet_txt2img(prompt, ref_img, batch_size=1, module='canny',url='http://127.0.0.1:7860'):
    base64_img = encode_pil_to_base64(ref_img)
    
    txt2img_value = {
        'prompt': prompt,
        'negative_prompt': 'lowres, blurry, bad anatomy, bad hands, cropped, worst quality',
        'sampler_name': 'DPM++ 2M Automatic',
        'batch_size': batch_size,
        'steps': 20,
        'cfg_scale': 9,
        'width': 768,   # TODO: make image width & height the same aspect ratio as the input image
        'height': 768,
        'alwayson_scripts': {x
            'controlnet': {     # TODO: implement multiple controlnet units
                'args': [
                    {
                        'enabled': True,
                        'module': module,
                        'model': cnet_modules[module],
                        'image': base64_img,
                        'pixel_perfect': True
                    }
                ]
            }
        }
    }
    
    response = requests.post(url=f'{url}/sdapi/v1/txt2img', json=txt2img_value)
    
    output_images = []
    for i in range(batch_size):
        output_images.append(decode_base64_to_image(response.json()['images'][i]))
    
    return output_images