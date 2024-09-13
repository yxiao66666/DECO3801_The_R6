import io
import base64
import requests
import numpy as np

from PIL import Image


class StableDiffusionBackBone:
    
    def __init__(self, url='http://127.0.0.1:7860') -> None:
        self.webui_url = url
        
        # Supported control modules
        self.module_list = [
            'canny', 'mlsd', 
            'openpose_faceonly', 'openpose_hand', 'dw_openpose_full', 'animal_openpose', 
            'depth_anything_v2', 
            'seg_ofade20k', 'seg_anime_face', 
            'shuffle', 't2ia_color_grid'
        ]
        self.controlnet_modules = {
            # Edge detectors
            'canny': 'control_v11p_sd15_canny [d14c016b]',                                  # general purpose
            'invert (from white bg & black line)': 'control_v11p_sd15_canny [d14c016b]',    # inverted canny, for white bg and black line
            'mlsd': 'control_v11p_sd15_mlsd [aca30ff0]',                                    # straight lines
            
            # OpenPose
            'openpose_faceonly': 'control_v11p_sd15_openpose [cab727d4]',                   # facial detail transfer
            'openpose_hand': 'control_v11p_sd15_openpose [cab727d4]',                       # hands and fingers detail transfer
            'dw_openpose_full': 'control_v11p_sd15_openpose [cab727d4]',                    # eyes, nose, eyes, neck, shoulder, elbow, wrist, knees, ankles...
            'animal_openpose': 'control_v11p_sd15_openpose [cab727d4]',                     # animal pose transfer, doesn't work too well
            
            # Depth maps
            'depth_anything_v2': 'control_v11f1p_sd15_depth [cfd03158]',                    # detailed depth map reference
            
            # Segmentation 
            'seg_ofade20k': 'control_v11p_sd15_seg [e1f51eb9]',                             # transfer the location and shape of objects
            'seg_anime_face': 'control_v11p_sd15_seg [e1f51eb9]',                           # does the same thing above, but optimised for anime faces
            
            # Color scheme
            'shuffle': 'control_v11e_sd15_shuffle [526bfdae]',                              # transfer color scheme
            't2ia_color_grid': 't2iadapter_color_sd14v1 [8522029d]',                        # color grid inplace reference
        }
        self.weights = {
            'canny': {'high': 1.5, 'balanced': 1.0, 'low': 0.1},
            'invert (from white bg & black line)': {'high': 1.5, 'balanced': 1.0, 'low': 0.1},
            'mlsd': {'high': 1.6, 'balanced': 0.95, 'low': 0.35},
            
            'openpose_faceonly': {'high': 1.0, 'balanced': 1.0, 'low': 0.6},
            'openpose_hand': {'high': 1.0, 'balanced': 1.0, 'low': 0.6},
            'dw_openpose_full': {'high': 1.0, 'balanced': 1.0, 'low': 0.6},
            'animal_openpose': {'high': 1.0, 'balanced': 1.0, 'low': 0.6},
            
            'depth_anything_v2': {'high': 1.5, 'balanced': 1.0, 'low': 0.4},
            
            'seg_ofade20k': {'high': 1.0, 'balanced': 1.0, 'low': 1.0},
            'seg_anime_face': {'high': 1.0, 'balanced': 1.0, 'low': 1.0},
            
            'shuffle': {'high': 0.8, 'balanced': 0.5, 'low': 0.3},
            't2ia_color_grid': {'high': 1.3, 'balanced': 0.9, 'low': 0.7}
        }
        
        # Control images stored in PIL.Image
        self.control_image_0 = None
        self.control_image_1 = None
        self.control_image_2 = None
        
        # Controlnet unit args
        self.control_unit_0 = None
        self.control_unit_1 = None
        self.control_unit_2 = None
        
        # Inpaint image and mask stored in PIL.Image 
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
    
    def __inpaint_control_preprocessor(self, control_image, keep_aspect_ratio) -> Image:
        '''
        Centers the control image to the mask region for inpainting.
        
        Args:
            control_image (Image): Control image in PIL Image type
        
        Returns:
            image (Image): a recentered control image with transparent background
        
        Requires:
            Single, rectangle mask region
        '''
        if self.inpaint_mask is None:
            return
        if control_image is None:
            return None
        
        mask = self.inpaint_mask.convert('L')
        mask_arr = np.array(mask)
        white_region = np.where(mask_arr == 255)
        
        # Getting bounding box coordinates for white region
        top_left = (np.min(white_region[1]), np.min(white_region[0]))
        bottom_right = (np.max(white_region[1]), np.max(white_region[0]))
        
        # Width & Height
        white_region_width = bottom_right[0] - top_left[0]
        white_region_height = bottom_right[1] - top_left[1]
        
        if keep_aspect_ratio:
            image_aspect_ratio = control_image.width / control_image.height
            target_aspect_ratio = white_region_width / white_region_height
            
            if target_aspect_ratio > image_aspect_ratio:
                # Height is the limiting factor
                new_height = white_region_height
                new_width = int(new_height * image_aspect_ratio)
            else:
                # Width is the limiting factor
                new_width = white_region_width
                new_height = int(new_width / image_aspect_ratio)
            
            resized_image = control_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Center the resized image in the white region
            x_offset = top_left[0] + (white_region_width - new_width) // 2
            y_offset = top_left[1] + (white_region_height - new_height) // 2
        else:
            resized_image = control_image.resize((white_region_width, white_region_height))
            x_offset = top_left[0]
            y_offset = top_left[1]
        
        # Put the resized image into a new canvas
        canvas = Image.new("RGBA", mask.size)
        canvas.paste(resized_image, (x_offset, y_offset))
        
        return canvas
    
    def add_control_unit(self, unit_num, image_path, module, intensity='balanced') -> None:
        '''
        Enables a control unit slot, specified by unit number [0, 1, 2].
        
        Args:
            unit_num (int): the control unit slot to enable, 0 or 1 or 2
            image_path (str): image path
            module (str): specify the control module to use, ['canny', 'mlsd', 'lineart_anime', 'openpose_faceonly', 
                'openpose_hand', 'dw_openpose_full', 'animal_openpose', 'depth_anything_v2', 
                'seg_ofade20k', 'seg_anime_face', 'shuffle', 't2ia_color_grid']
            intensity (str): specify control intensity, 'low' or 'balanced' or 'high'
        '''
        if unit_num > 2 or unit_num < 0:
            return
        if image_path is None:
            return
        if module is None:
            return
        if module not in self.module_list:
            return
        if intensity not in ['high', 'balanced', 'low']:
            return
        
        image = Image.open(image_path)
        b64_image = self.__encode_to_base64(image)
        
        processor_res = 768
        pixel_perfect = True
        if module == 't2ia_color_grid':
            processor_res = 1024
            pixel_perfect = False
        
        controlnet_arg = {
            'enabled': True,
            'module': module,
            'model': self.controlnet_modules[module],
            'image': b64_image,
            'pixel_perfect': pixel_perfect,
            'weight': self.weights[module][intensity],
            'processor_res': processor_res
        }
        
        if unit_num == 0:
            self.control_image_0 = image
            self.control_unit_0 = controlnet_arg
        elif unit_num == 1:
            self.control_image_1 = image
            self.control_unit_1 = controlnet_arg
        elif unit_num == 2:
            self.control_image_2 = image
            self.control_unit_2 = controlnet_arg
    
    def remove_control_unit(self, unit_num) -> None:
        '''
        Removes the specified control unit.
        
        Args:
            unit_num (int): the control unit slot to remove, 0 or 1 or 2
        '''
        if unit_num > 2 or unit_num < 0:
            return
        
        if unit_num == 0:
            self.control_image_0 = None
            self.control_unit_0 = None
        elif unit_num == 1:
            self.control_image_1 = None
            self.control_unit_1 = None
        elif unit_num == 2:
            self.control_image_2 = None
            self.control_unit_2 = None
    
    def remove_all_control_units(self) -> None:
        '''
        Removes all internal control units.
        '''
        self.control_image_0 = None
        self.control_image_1 = None
        self.control_image_2 = None
        
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
        self.__init__(url=self.webui_url)
    
    def txt2img(self, prompt='', batch_size=3):
        '''
        Request WebUI to txt2img.
        
        Args:
            prompt (str): optional, text prompt
            batch_size (int): optional, number of generations in one batch
        
        Returns:
            TODO: 
        '''
        control_units = [
            self.control_unit_0,
            self.control_unit_1,
            self.control_unit_2
        ]
        
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
                    'args': control_units
                }
            }
        }
        response = requests.post(url=f'{self.webui_url}/sdapi/v1/txt2img', json=txt2img_value)
        
        output_images = []
        for i in range(batch_size):
            output_images.append(self.__decode_base64(response.json()['images'][i]))
        
        return output_images
    
    def img2img_inpaint(self, prompt='', batch_size=3, keep_aspect_ratio=False):
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
        
        temp_control_unit_0 = None
        temp_control_unit_1 = None
        temp_control_unit_2 = None
        
        # Preprocess control images if controlnet unit has been added
        if (
            self.control_image_0 is not None 
            or self.control_image_1 is not None 
            or self.control_image_2 is not None
        ):            
            if self.control_unit_0 is not None:
                preprocessed_image_0 = self.__inpaint_control_preprocessor(self.control_image_0, keep_aspect_ratio)
                temp_control_unit_0 = {
                    'enabled': True,
                    'module': self.control_unit_0['module'],
                    'model': self.control_unit_0['model'],
                    'image': self.__encode_to_base64(preprocessed_image_0),
                    'pixel_perfect': True,
                    'weight': self.control_unit_0['weight']
                }
                
            if self.control_unit_1 is not None:
                preprocessed_image_1 = self.__inpaint_control_preprocessor(self.control_image_1, keep_aspect_ratio)
                temp_control_unit_1 = {
                    'enabled': True,
                    'module': self.control_unit_1['module'],
                    'model': self.control_unit_1['model'],
                    'image': self.__encode_to_base64(preprocessed_image_1),
                    'pixel_perfect': True,
                    'weight': self.control_unit_1['weight']
                }
                
            if self.control_unit_2 is not None:
                preprocessed_image_2 = self.__inpaint_control_preprocessor(self.control_image_2, keep_aspect_ratio)
                temp_control_unit_2 = {
                    'enabled': True,
                    'module': self.control_unit_2['module'],
                    'model': self.control_unit_2['model'],
                    'image': self.__encode_to_base64(preprocessed_image_2),
                    'pixel_perfect': True,
                    'weight': self.control_unit_2['weight']
                }
            
        control_units = [
            temp_control_unit_0,
            temp_control_unit_1,
            temp_control_unit_2
        ]
        
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
            'alwayson_scripts': {
                'controlnet': {
                    'args': control_units
                }
            }
        }
        
        response = requests.post(url=f'{self.webui_url}/sdapi/v1/img2img', json=img2img_value)
        
        output_images = []
        for i in range(batch_size):
            output_images.append(self.__decode_base64(response.json()['images'][i]))
        
        return output_images
    