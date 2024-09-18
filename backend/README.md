# Backend

## Dependencies

- flask
- flask_cors
- flask_sqlalchemy
- pillow
- pymysql
- requests
- sqlalchemy
- transformers

Run the command below to install the dependencies. 

```bash
pip install flask flask_cors flask_sqlalchemy pillow pymysql requests sqlalchemy transformers
```

> For the dependencies of the Stable Diffusion model, refer to [this documentation](controlnet\README.md)

## Database

Our database is based on PHPMyAdmin and the application interacts with it using SQL Alchemy. The implementation provides a protection from malicious access requests such as SQL injection. The overview of the relational database is summarised in the below image:

## Image Search

Arty utilises Pinterest API to search images based on the keyword provided by the user. The keyword is handed to the flask application `app.py`, then the keyword or an image is handed over the the module `search_engine_access.py`. If the handed request contains a reference image, a caption is generated using BlipProcessor, then is handed over to the Pinterest API. The returned image from the backend is assigned with a unique id for each image.

<img src = '..\images\db.png' alt = 'database structure'>