import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Import AFTER load_dotenv so pydantic BaseSettings picks it up
from app.services.groq_service import groq_service

async def main():
    service = groq_service
    try:
        print(f"Testing Groq initialization...")
        print(f"API Key in env: {'Yes' if os.environ.get('GROQ_API_KEY') else 'No'}")
        print(f"API Key in settings: {'Yes' if service.api_key else 'No'}")
        print(f"GROQ_MODELS: {os.environ.get('GROQ_MODELS')}")
        print(f"GROQ_MODEL: {os.environ.get('GROQ_MODEL')}")
        
        result, latency, msg, metadata = service.synthesize_analysis(
            user_query="Smoke test",
            analysis_payload={"test": "data"}
        )
        print(f"Result: {result}")
        print(f"Latency: {latency}")
        print(f"Msg: {msg}")
        print(f"Metadata: {metadata}")
    except Exception as e:
        print(f"FAILURE: {type(e).__name__} - {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
