import os
from pathlib import Path
from datetime import datetime
from moviepy import VideoFileClip
'''
def get_history_path(filename="render.mp4"):
    """
    Finds the directory of the current script and creates a 'history' 
    folder inside it if it doesn't exist.
    """
    # 1. Get the directory where THIS script is located
    base_dir = Path(__file__).resolve().parent
    history_dir = base_dir / "history"

    # 2. Create the folder (exist_ok=True makes it optimal/no-crash)
    history_dir.mkdir(parents=True, exist_ok=True)

    
    return history_dir / filename

def save_video_to_history(clip, original_name="output.mp4"):
    
    """
    Helper to save a MoviePy clip into the history folder.
    """
    target_path = get_history_path(original_name)
    
    # MoviePy 2.x handles Path objects, but str() is safer for ffmpeg backends
    clip.write_videofile(str(target_path), codec="libx264", audio_codec="aac")
    
    print(f"✅ Video successfully archived at: {target_path}")
    return target_path'''

import os

# Define the three tiers
INPUT_DIR = "input_folder"
TEMP_DIR = "temp"
HISTORY_DIR = "history"

def determine_path(filename, is_final=False):
    """
    Decides exactly where a file should be read from or saved to.
    """
    # 1. If it's the final step, it ALWAYS goes to History
    if is_final:
        return os.path.join(HISTORY_DIR, filename)
    
    # 2. Check if it's a raw source file in the Input folder
    input_path = os.path.join(INPUT_DIR, filename)
    if os.path.exists(input_path):
        return input_path
    
    # 3. If it's not a raw source and not the final step, it's a Temp file
    return os.path.join(TEMP_DIR, filename)

def save_video_to_history(clip, target_full_path):
    """
    Simply writes the clip to the exact path provided.
    The dispatcher has already decided if this is Temp or History.
    """
    # Ensure the parent directory exists just in case
    os.makedirs(os.path.dirname(target_full_path), exist_ok=True)
    
    clip.write_videofile(
        str(target_full_path), 
        codec="libx264", 
        audio_codec="aac",
        temp_audiofile=os.path.join(TEMP_DIR, "temp-audio.m4a"), # Keep audio temp files in temp too!
        remove_temp=True
    )
    print(f"💾 File Saved: {target_full_path}")