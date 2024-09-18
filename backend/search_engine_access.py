"""
This Module mainly provides access to pintrest and any other image search engines we would like
to use in the future.

- v0.0.2 Basic Pintrest Search Available
- v0.0.3 Add support for image query with BLIP
"""

from math import floor
from time import time
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration

import json
import requests

from flask import Flask


class QueryMissmatchException(BaseException):
    """Exception for when main query does not match query from options dictionary"""

    def __init__(self, *args: object) -> None:
        super().__init__(*args)


def generate_image_caption(image_path: str, model: BlipForConditionalGeneration, processor: BlipProcessor) -> str:
    """Generate caption from the provided image for searching
    
    Args:
        image (str): The path to the image file to query

    Returns:
        caption (str): A description of the image
    """
    # TODO: After Flask is implemented, the model should be made so that it's always online.
    # processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')
    # model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir='blip_weights')
    
    image = Image.open(image_path)
    inputs = processor(images=image, return_tensors="pt")
    outputs = model.generate(**inputs)
    caption = processor.decode(outputs[0], skip_special_tokens=True)

    return caption

def search_pinterest(
    query: str, options: dict[str, str] | None = None, context: str = "{}", timeout: float = 100.0
) -> requests.Response:
    """Querys pinterest for images

    Args:
        query (str): The search query to send to pinterest
        options (dict[str,str] | None, optional): Any extra arguments for the search. Defaults to {}.
        content (str, optional): Unknown extra argument, can be supplied. Defaults to "{}".

    Returns:
        requests.Response: The entire, unprocessed response from py-requests
    """
    if query[0] != query[-1] or query[0] != '"':
        query = f'"{query}"'
    if not options:
        options = {}
    if not options.get('"rs"'):
        options['"rs"'] = '"typed"'
    if not options.get('"query"'):
        options['"query"'] = query
    elif query != options.get('"query"'):
        raise QueryMissmatchException()
    request = (
        r"https://www.pinterest.com.au/resource/BaseSearchResource/get/?source_url=/search/pins/?q="
        + options['"query"'][1:-1]
        + r"&rs="
        + options['"rs"']
        + r'&data={"options":{"applied_filters":null,"appliedProductFilters":"---","article":null,"auto_correction_disabled":false,"corpus":null,"customized_rerank_type":null,"domains":null,"filters":null,"journey_depth":null,"page_size":null,"price_max":null,"price_min":null,"query_pin_sigs":null,"query":'
        + options['"query"']
        + r',"redux_normalize_feed":true,"rs":'
        + options['"rs"']
        + r',"scope":"pins","selected_one_bar_modules":null,"source_id":null,"source_module_id":null,"top_pin_id":""},"context":{}}&_='
        + str(floor(time() * 1000))
    )
    return requests.get(request, timeout=timeout)

def response_pull_images(response:requests.Response, img_size:str ="236x") -> list[str]:
    """Takes a http response from a search engine and return a list of the returned images

    Args:
        response (requests.Response): The response recieved from a search function
            (search_pinterest)

    Returns:
        list[str]: A list of links to images.
    """
    parsed = json.loads(response.content)
    out = []
    for im_dat in parsed["resource_response"]["data"]["results"]:
        out.append(im_dat["images"][img_size]["url"])

    return out
