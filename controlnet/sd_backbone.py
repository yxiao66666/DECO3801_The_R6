import io
import base64
import requests

from PIL import Image


class StableDiffusionBackBone:
    
    def __init__(self, url='127.0.0.1:7890') -> None:
        self.webui_url = url
        
        self.controlnet_modules = {
            'canny': 'control_v11p_sd15_canny [d14c016b]',                      # general purpose
            'lineart_anime': 'control_v11p_sd15s2_lineart_anime [3825e83e]',    # line art
            'shuffle': 'control_v11e_sd15_shuffle [526bfdae]',                  # transfer color scheme
            'mlsd': 'control_v11p_sd15_mlsd [aca30ff0]'                         # straight lines
        }
        
        self.control_unit_0 = None
        self.control_unit_1 = None
        self.control_unit_2 = None
        
        self.control_units = {
            self.control_unit_0,
            self.control_unit_1,
            self.control_unit_2
        }
        
        self.inpaint_image = None
        self.inpaint_mask = None
    
    def __decode_base64(self, b64_encoding) -> Image:
        '''
        Decode base64 image to PIL Image
        
        Args:
            b64_encoding (str): image in base64 encoding

        Returns:
            image (Image): PIL Image
        '''
        if b64_encoding.startswith('data:image/'):
            b64_encoding = b64_encoding.split(':')[1].split(',')[1]
        image = Image.open(io.BytesIO(base64.b64decode(b64_encoding)))
        
        return image
    
    def __encode_to_base64(self, image):
        '''
        Encode PIL Image to base64 format
        
        Args:
            image (Image): PIL Image

        Returns:
            base64_image (str): image in base64 encoding
        '''
        with io.BytesIO() as output_bytes:
            image.save(output_bytes, format='PNG')
            bytes_data = output_bytes.getvalue()
            
        return base64.b64encode(bytes_data).decode('utf-8')
    
    def add_control_unit(self, unit_num, image_path, module, intensity='high') -> None:
        '''
        Enables a control unit slot, specified by unit number [0, 1, 2].
        
        Args:
            unit_num (int): the control unit slot to enable, 0 or 1 or 2
            image_path (str): image path
            module (str): specify the control module to use, 
            intensity (str): specify control intensity, 'low' or 'mid' or 'high'
        '''
        if unit_num > 2 or unit_num < 0:
            return
        if image_path is None:
            return
        if module is None:
            return
        
        image = Image.open(image_path)
        b64_image = self.__encode_to_base64(image)
        
        controlnet_arg = {
            'enabled': True,
            'module': module,
            'model': self.controlnet_modules[module],
            'image': b64_image,
            'pixel_perfect': True
        }
        
        if unit_num == 0:
            self.control_unit_0 = controlnet_arg
        elif unit_num == 1:
            self.control_unit_1 = controlnet_arg
        elif unit_num == 2:
            self.control_unit_2 = controlnet_arg
    
    def remove_control_unit(self, unit_num) -> None:
        '''
        Removes the specified control unit.
        '''
        if unit_num > 2 or unit_num < 0:
            return
        
        if unit_num == 0:
            self.control_unit_0 = None
        elif unit_num == 1:
            self.control_unit_1 = None
        elif unit_num == 2:
            self.control_unit_2 = None
    
    def remove_all_control_units(self) -> None:
        '''
        Removes all internal control units.
        '''
        self.control_unit_0 = None
        self.control_unit_1 = None
        self.control_unit_2 = None
    
    def add_inpaint_image(self, image_path) -> None:
        '''
        Add image for inpaint.
        
        Args:
            image_path (str): image path
        '''
        if image_path is None:
            return
        
        image = Image.open(image_path)
        self.inpaint_image = image
    
    def add_inpaint_mask(self, mask_path) -> None:
        '''
        Add inpaint mask.
        An inpaint image needs to be added first before adding a mask.
        Mask should be in the same size as the inpaint image.
        
        Args:
            mask_path (str): mask path
        '''
        if mask_path is None:
            return
        if self.inpaint_image is None:
            return
        
        mask = Image.open(mask_path)
        if mask.size != self.inpaint_image.size:
            return
        self.inpaint_mask = mask
    
    def remove_inpaint(self) -> None:
        '''
        Remove inpaint image and inpaint mask
        '''
        self.inpaint_image = None
        self.inpaint_mask = None
    
    def reset(self) -> None:
        '''
        Reset the backbone, removes all internal variables and images.
        '''
        self.__init__()
    
    def txt2img(self, prompt='', batch_size=3):
        '''
        Request WebUI to txt2img.
        
        Args:
            prompt (str): optional, text prompt
            batch_size (int): optional, number of generations in one batch
        
        Returns:
            TODO: 
        '''
        txt2img_value = {
            'prompt': prompt,
            'negative_prompt': 'lowres, blurry, bad anatomy, bad hands, cropped, worst quality',
            'sampler_name': 'DPM++ 2M Automatic',
            'batch_size': batch_size,
            'steps': 20,
            'cfg_scale': 9,
            'width': 768,   
            'height': 768,
            'alwayson_scripts': {
                'controlnet': {
                    'args': [
                        self.control_units
                    ]
                }
            }
        }
        
        response = requests.post(url=f'{self.webui_url}/sdapi/v1/txt2img', json=txt2img_value)
        
        output_images = []
        for i in range(batch_size):
            output_images.append(self.__decode_base64(response.json()['images'][i]))
        
        return output_images
    
    def img2img_inpaint(self, prompt='', batch_size=3):
        '''
        Request WebUI to inpaint.
        
        Args:
            prompt (str): optional, text prompt
            batch_size (int): optional, number of generations in one batch
        
        Returns:
            TODO: 
        '''
        if self.inpaint_image is None:
            return
        if self.inpaint_mask is None:
            return
        
        b64_inpaint_image = self.__encode_to_base64(self.inpaint_image)
        b64_inpaint_mask = self.__encode_to_base64(self.inpaint_mask)
        
        img2img_value = {
            'prompt': prompt,
            'negative_prompt': 'lowres, blurry, bad anatomy, bad hands, cropped, worst quality',
            'init_images': [b64_inpaint_image],
            'mask': b64_inpaint_mask,
            'sampler_name': 'DPM++ 2M Automatic',
            'batch_size': batch_size,
            'steps': 20,
            'cfg_scale': 9,
            'width': 768,   
            'height': 768,
            'denoising_strength': 0.75,     # low level = small change, vice versa
            'image_cfg_scale':1.5,
            'initial_noise_multiplier': 1,
            'inpaint_full_res': 1,
            'inpaint_full_res_padding': 32,
            'inpainting_fill': 1,           # 1 = original, 0 = fill, 2 = latent noise, 3 = latent fill
            'inpainting_mask_invert': 0,
            'mask_blur': 10,
            'mask_blur_x': 10,
            'mask_blur_y': 10,
            'mask_round': False,            # False = soft inpainting
            'resize_mode': 1,
            'alwayson_scripts': {}
        }
        
        response = requests.post(url=f'{self.webui_url}/sdapi/v1/img2img', json=img2img_value)
        
        output_images = []
        for i in range(batch_size):
            output_images.append(self.__decode_base64(response.json()['images'][i]))
        
        return output_images
    