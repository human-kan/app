import requests
import json

API_KEY = "AIzaSyAFiM13NFCk1IFFNN1_1lPOD00a-F3Aet8"
url = f"https://generativelanguage.googleapis.com/v1/models?key={API_KEY}"

print("Connecting to Gemini API...")
try:
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print("\n[SUCCESS] Connection Established!")
        print("\nAvailable Models for your API Key:")
        print("-" * 50)
        for model in data.get('models', []):
            name = model.get('name', 'Unknown')
            displayName = model.get('displayName', 'No Display Name')
            methods = ", ".join(model.get('supportedGenerationMethods', []))
            print(f"Model Name: {name}")
            print(f"Display Name: {displayName}")
            print(f"Methods: {methods}")
            print("-" * 50)
    else:
        print(f"\n[ERROR] API returned status code: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"\n[CRITICAL ERROR] Could not connect: {str(e)}")
