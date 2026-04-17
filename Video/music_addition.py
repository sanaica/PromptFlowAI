import os
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip,afx
from history_maintain import save_video_to_history as save

# ---------------------------------------------------------
# DYNAMIC PATH RESOLUTION (Cross-Platform / Reviewer Safe)
# ---------------------------------------------------------
# 1. Get the directory where music_addition.py currently lives (.../Video)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Go up one level to the parent directory (where both folders live)
PARENT_DIR = os.path.dirname(SCRIPT_DIR)

# 3. Walk down into the Video Editor Project to find the .env
ENV_PATH = os.path.join(PARENT_DIR, "VideoEditorProject", "frontend", ".env")

# 4. Load the .env variables manually (No external libraries needed!)
if os.path.exists(ENV_PATH):
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()
else:
    print(f"Warning: .env file not found at {ENV_PATH}")

# 5. Safely get the ID. NO HARDCODED FALLBACKS!
API_KEY = os.environ.get("JAMENDO_CLIENT_ID")

# If the key is missing, stop the script and tell the reviewer exactly what to do.
if not API_KEY:
    raise ValueError(
        "\n"
        "===========================================================\n"
        "CRITICAL ERROR: JAMENDO_CLIENT_ID is missing!\n"
        "Reviewer: Please ensure you have created a .env file inside\n"
        "the 'Video Editor Project/frontend' directory with your API keys.\n"
        "===========================================================\n"
    )

# ---------------------------------------------------------
# MUSIC ADDITION LOGIC
# ---------------------------------------------------------

def format_url(user_desc):
    param = {
        "client_id": API_KEY,      
        "format": "json",
        "limit": 5,                
        "search": user_desc, 
        "include": "musicinfo",    
        "audioformat": "mp32"  
    }    
    return param
    
def download_audio(user_desc):
    # The "Engineering" way to get the file
    import requests
   
# 1. Request the track info
    response = requests.get(url="https://api.jamendo.com/v3.0/tracks/",params=format_url(user_desc))
    data = response.json()

# 2. Extract the specific URL (Knowledge check: why ['results'][0]?)
    music_url = data['results'][0]['audio']

# 3. Download the binary data
    music_data = requests.get(music_url).content
    with open("downloaded_music.mp3", "wb") as f:       
        f.write(music_data)
    return "downloaded_music.mp3"
    
#integrate with video
def integrate_music(user_desc,output,input,loop=True):
# 1. Load your video and the music
    video = VideoFileClip(input)
    audio = AudioFileClip(download_audio(user_desc))

# 2. Adjust audio duration (optional)

    if loop and audio.duration < video.duration:
       audio = audio.with_effects([afx.AudioLoop(duration=video.duration)])
    
    # CASE 2: Audio is longer (or looping is off), we must trim it
    # This ensures the audio ends exactly when the video ends
    else:
        audio = audio.with_duration(video.duration)
    video = video.with_audio(audio)
  
# 4. Save the result
    save(video,output)
    #video.write_videofile("final_output.mp4", codec="libx264", audio_codec="aac")

def no_audio(input,output):
    video=VideoFileClip(input)
    video=video.without_audio()
    save(video,output)
    #video.write_videofile("final_output.mp4", codec="libx264", audio_codec="aac")

        