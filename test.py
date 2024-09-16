import json
import requests

if __name__ == '__main__':
    # URL of your Flask application
    url = 'http://localhost:5000/user'  # Adjust if your app runs on a different host/port

    # Prepare the data to be sent in the POST request
    user_data = {
        'user_name': 'Terry',
        'user_password': 'Davis'
    }

    # Make a POST request to the /add_user endpoint
    # response = requests.post(url, data=json.dumps(user_data), headers={'Content-Type': 'application/json'})
    response = requests.get(url, headers={'Content-Type': 'application/json'})


    # Print the response
    print(f'Status Code: {response.status_code}')
    print('Response JSON:', response.json())