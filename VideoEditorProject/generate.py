import sys
import os
import json  # <-- We need this to read the JSON properly!

# ─── THE BRIDGE (Force Python to find your libraries) ───
user_home = os.path.expanduser("~")
user_libraries = os.path.join(user_home, "AppData", "Roaming", "Python", "Python313", "site-packages")
if user_libraries not in sys.path:
    sys.path.append(user_libraries)

# ─── IMPORTS ───
import replicate
import time
import requests

# ─── CONFIGURATION ───
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Native Environment Loader (Pointing to the frontend directory!)
env_path = os.path.join(PROJECT_DIR, "frontend", ".env") 

if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()
else:
    print(f"Warning: .env file not found at {env_path}")

# Safely pull the key (either from the file we just read, or from n8n)
api_key = os.environ.get("REPLICATE_API_TOKEN")

if not api_key:
    print("CRITICAL ERROR: REPLICATE_API_TOKEN is missing!")
    sys.exit(1)

# Ensure the replicate library can see it
os.environ["REPLICATE_API_TOKEN"] = api_key

# 2. Dynamic Paths
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_FILE = os.path.join(PROJECT_DIR, "Prompt", "prompt.txt")
#OUTPUT_FOLDER = os.path.join(PROJECT_DIR, "Gen")
#OUTPUT_VIDEO = os.path.join(OUTPUT_FOLDER, "vidgenerated.mp4")
#edit by gargi
OUTPUT_FOLDER = os.path.join(PROJECT_DIR, "Final")
OUTPUT_VIDEO = os.path.join(OUTPUT_FOLDER, "Final_Render.mp4")

def generate_video():
    print("Starting AI Video Generation...")

    # Default fallback prompt just in case
    user_prompt = "Realistic cinematic fire, intense flames, black background, 4k"

    # 1. Read & Parse Prompt JSON
    try:
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            raw_text = f.read().strip()
            
        # Clean markdown if Gemini added it
        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`").strip()
            if raw_text.lower().startswith("json"):
                raw_text = raw_text[4:].strip()
        
        # Extract ONLY the visual prompt for the AI!
        try:
            data = json.loads(raw_text)
            user_prompt = data.get("prompt", user_prompt)
            print(f" Successfully extracted visual prompt: '{user_prompt}'")
        except json.JSONDecodeError as e:
            print(f"Warning: Could not parse JSON format. Using raw text. Error: {e}")
            user_prompt = raw_text  # Fallback
            
    except FileNotFoundError:
        print("Error: prompt.txt not found! Using default.")

    # 2. SUBMIT THE JOB
    try:
        print(f"Submitting to Replicate (Minimax)...")
        
        # Run the model with ONLY the clean prompt string
        output = replicate.run(
            "minimax/video-01",
            input={
                "prompt": user_prompt,
                "prompt_optimizer": False
            }
        )
        
        # Get URL
        video_url = output
        print(f"Generation Complete! URL: {video_url}")

        # 3. DOWNLOAD
        print("Downloading video...")
        response = requests.get(video_url, timeout=60)
        
        if response.status_code == 200:
            if not os.path.exists(OUTPUT_FOLDER):
                os.makedirs(OUTPUT_FOLDER)
                
            with open(OUTPUT_VIDEO, "wb") as f:
                f.write(response.content)
            print(f"SAVED SUCCESS: {OUTPUT_VIDEO}")
        else:
            print("Failed to download video file.")

    except Exception as e:
        # Print error without emojis
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    generate_video()