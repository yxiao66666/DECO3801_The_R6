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

## Installation & Configuration
> Anaconda (miniconda) is used for virtual environment configuration, please refer to [anaconda's website](https://www.anaconda.com/download/success) for installation details.
>
> For installation of the Stable Diffusion backbone, refer to [the README in controlnet folder](controlnet\README.md)

The list of dependencies used can be found in [requirements.txt](backend/requirements.txt).

Run the command below to setup a conda virtual environment and install the dependencies:

```bash
conda create --name arty_backend --file requirements.txt
```

## Running the Server

1. Make a ssh tunnel to the uqcloud by entering the command
   `ssh -L 3306:localhost:3306 -J your_student_account@remote.labs.eait.uq.edu.au your_student_account@arty.zones.eait.uq.edu.au`.
   Make sure to keep this termianl open. (NOTE: If this does not work you may have to set your ssh key to the EAIT Remote Desktop first!)
3. Create a new terminal at the root directory, activate the conda virtual environment by running `conda activate arty_backend`.
4. From the same terminal, run `python backend/app.py` and keep this terminal open.
5. Now you are set up to run tests for the codebase. Feel free to tweek around the codes here and there.

## Key Services
### Database

Our database is based on PHPMyAdmin and the application interacts with it using SQL Alchemy. The implementation provides a protection from malicious access requests such as SQL injection. The overview of the relational database is summarised in the below image:

<img src = '..\images\db.png' alt = 'database structure'>

### Search Engine

Arty utilises Pinterest API to search images based on the keyword provided by the user. The keyword is handed to the flask application `app.py`, then the keyword or an image is handed over the the module `search_engine_access.py`. If the handed request contains a reference image, a caption is generated using BlipProcessor, then is handed over to the Pinterest API. The returned image from the backend is assigned with a unique id for each image.

### Stable Diffuion Backbone

Arty implements Stable Diffuion 1.5 with ControlNet extensions to provide image generation feature for fast idea visualisation and exploration. Plese find more details in [the README in controlnet folder](controlnet\README.md). 
