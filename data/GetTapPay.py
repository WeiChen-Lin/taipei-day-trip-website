import requests, json

def Non3Dpay(partner_key, prime, details, price, cardholder):

    url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"

    payload = {
        "prime": prime,
        "partner_key": partner_key,
        "merchant_id": "WCL_ESUN",
        "details":details,
        "amount": price,
        "cardholder": cardholder,
        "remember": False
    }

    headers = {
        "Content-Type" : "application/json",
        "x-api-key" : "partner_eG242VheRfsMe8wQG0xnldNJkZjEEVojO4e8m3H2BarFQBU6UzrW6hfi"
    }

    response = requests.post(url, data = json.dumps(payload), headers=headers)
    
    return response.text

