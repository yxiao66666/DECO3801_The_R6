# Backend
The backend server, built with Flask, handles various core functionalities of the application. 
 - `app.py` is the main server entry point and manages APIs for database access, search engine access, and Stable Diffusion backbone access.
 - `search_engine_access.py` contains all methods related to the search engine.
 - `controlnet/` folder contains the Stable Diffusion backbone code and ControlNet extensions.

## Updates:

>**IMPORTANT**: Utterly insecure accessing method to the database has been fixed. Follow the procedure below:
1. Firstly, run `pip install python-dotenv` on your terminal/powershell,etc.
2. Create `.env` file in the `\backend` folder
3. Insert the code `DB_LINK = ` to the `.env` file you created
4. For developers, **copy the link shared privately and paste it after the line you have inserted!**

## Process

1. Install all dependencies referring to [Dependencies](#dependencies)
2. Make a ssh tunnel to the uqcloud by entering the command `ssh -L 3306:localhost:3306 -J your_student_account@remote.labs.eait.uq.edu.au your_student_account@arty.zones.eait.uq.edu.au`. Make sure to keep this termianl open. (NOTE: If this does not work you may have to set your ssh key to the EAIT Remote Desktop first!)
3. Run `backend/app.py` from a different terminal, and ensure that this is kept open.
4. Now you are set up to run tests for the codebase. Feel free to tweek around the codes here and there.

## Dependencies

- flask
- flask_cors
- flask_sqlalchemy
- pillow
- pymysql
- python-dotenv
- pytorch
- requests
- sqlalchemy
- transformers

Run the command below to install the dependencies. 

```bash
pip install flask flask_cors flask_sqlalchemy pillow pymysql python-dotenv torch requests sqlalchemy transformers
```

> For the dependencies of the Stable Diffusion model, refer to [the README in controlnet folder](controlnet\README.md)

## Database

Our database is based on PHPMyAdmin and the application interacts with it using SQL Alchemy. The implementation provides a protection from malicious access requests such as SQL injection. The overview of the relational database is summarised in the below image:

<img src = '..\images\db.png' alt = 'database structure'>

## Image Search

Arty utilises Pinterest API to search images based on the keyword provided by the user. The keyword is handed to the flask application `app.py`, then the keyword or an image is handed over the the module `search_engine_access.py`. If the handed request contains a reference image, a caption is generated using BlipProcessor, then is handed over to the Pinterest API. The returned image from the backend is assigned with a unique id for each image.
