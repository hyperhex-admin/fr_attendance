import json
import requests


# Function to get the Bearer token
def get_bearer_token(auth_url, client_id, client_secret):
    # Prepare the payload for the token request
    payload = {
    "username": "tjpatel@kirbymetalrecycling.com",
    "password": "Kirby#5832"
    }

    # Make the request to get the token
    response = requests.post(auth_url, data=payload)
    response_str = response.content.decode('utf-8')
    # Parse the JSON response
    response_json = json.loads(response_str)

    # Extract the Bearer token
    bearer_token = response_json['data']['access']

    # Print the Bearer token
    print("Bearer Token:", bearer_token)
    # Check if the request was successful
    if response.status_code == 200:
        token_info = response.json()
        return bearer_token
    else:
        print(f"Failed to obtain token: {response.status_code} - {response.text}")
        return None


# Function to make a POST request using the Bearer token
def make_post_request(api_url, bearer_token, data):
    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "Content-Type": "application/json",
    }

    # Make the POST request
    response = requests.post(api_url, headers=headers, json=data)

    # Check the response
    if response.status_code == 200:
        print(response.content)
        excel_bytes = response.content
    
        # Save the bytes to an Excel file
        output_file = 'output.csv'
        with open(output_file, 'wb') as f:
            f.write(excel_bytes)
        
        print(f"Excel file saved as {output_file}")
        print("POST request successful:", response.json())
    else:
        print(f"POST request failed: {response.status_code} - {response.text}")


# Main function
if __name__ == "__main__":
    # Replace these with your actual values
    AUTH_URL = "https://office-api.ngteco.com/oauth2/api/v1.0/token"  # URL to get the Bearer token
    CLIENT_ID = "your_client_id"
    CLIENT_SECRET = "your_client_secret"
    API_URL = "https://office-api.ngteco.com/att/api/v1.0/timecard/download/?current=1&pageSize=10&date_range=2024-08-01&date_range=2024-08-14&keyword=&abnormal_records=false&all=false"  # URL for the POST request
    DATA = {
        "fields": {
            "employee_code": {"alias": "Person ID"},
            "first_name": {"alias": "First Name"},
            "last_name": {"alias": "Last Name"},
            "att_date": {"alias": "Date"},
            "timesheet_name": {"alias": "Timesheet"},
            "clock_in": {"alias": "Clock In"},
            "clock_out": {"alias": "Clock Out"},
            "period_hrs": {"alias": "Clock Time(h)"},
            "paid_work": {"alias": "Total Work Time(h)"},
            "pairing": {"alias": "Statistic Rule Mode"},
            "abnormal_situation": {"alias": "Abnormal Situation"},
        },
        "title": "Timecard Report",
        "file_type": "csv",
        "share": [],
    }

    # Get the Bearer token
    token = get_bearer_token(AUTH_URL, CLIENT_ID, CLIENT_SECRET)

    if token:
        # Make the POST request with the Bearer token
        make_post_request(API_URL, token, DATA)
