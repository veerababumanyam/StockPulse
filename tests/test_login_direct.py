import asyncio
import json

import httpx


async def test_login_direct():
    try:
        async with httpx.AsyncClient() as client:
            login_data = {"email": "admin@sp.com", "password": "admin@123"}

            print(f"🚀 Testing login endpoint...")
            print(f"Request: POST http://localhost:8000/api/v1/auth/login")
            print(f"Body: {login_data}")
            print()

            response = await client.post(
                "http://localhost:8000/api/v1/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"},
            )

            print(f"📊 Response:")
            print(f"   Status: {response.status_code}")
            print(f"   Headers: {dict(response.headers)}")

            try:
                response_json = response.json()
                print(f"   Body: {json.dumps(response_json, indent=2)}")
            except:
                print(f"   Body (text): {response.text}")

            if response.status_code == 200:
                print(f"✅ Login successful!")
            else:
                print(f"❌ Login failed with status {response.status_code}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_login_direct())
