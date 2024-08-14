"""
This Module mainly provides access to pintrest and any other image search engines we would like
to use in the future.

- v0.0.2 Basic Pintrest Search Available
"""

from math import floor
from time import time
import requests


class QueryMissmatchException(BaseException):
    """Exception for when main query does not match query from options dictionary"""

    def __init__(self, *args: object) -> None:
        super().__init__(*args)


def search_pinterest(
    query: str, options: dict[str, str] | None = None, context: str = "{}"
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
    return requests.get(request)
