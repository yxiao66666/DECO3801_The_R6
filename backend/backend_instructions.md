# Instructions Before Start Using Backend

>It turns out that we must set up backend and frontend separately, you must create a ```pipenv``` to aside from the ```npm``` for the frontend. Refer to the instructions below:

## Process

1. Navigate yourself to the ```/backend``` directory on your terminal
2. Run ```pip install pipenv```
3. Once the download is complete, set up the environment by running ```pipenv install flask```. If you are testing for the integration with frontend, run ```pipenv install flask_cors``` as well to enable Cross-Origin Resouce Sharing (CORS).
4. Run ```pipenv shell``` and run ```export FLASK_APP = app.py``` (MacOS), or ```set FLASK_APP = app.py``` (Terminal), or ```$env:FLASK_APP = app.py``` (Windows Powershell).
5. ```flask run``` to start the application.

> **The process could be easier if you are on VS code as you could set the python interpreter to the ```pipenv``` in your directory. This allows you to run the flask application like your normal code from the execution button at the top right corner.** <br>