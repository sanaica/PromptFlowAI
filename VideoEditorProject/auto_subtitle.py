import sys
import os
import subprocess
import math
import io
import shutil

# --- 1. BRIDGE ---
# Force UTF-8 encoding so emojis/special characters don't crash Windows CMD
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Dynamically find the current user's AppData folder!
user_home = os.path.expanduser("~")
user_libraries = os.path.join(user_home, "AppData", "Roaming", "Python", "Python313", "site-packages")
if user_libraries not in sys.path:
    sys.path.append(user_libraries)

# You will need to install whisper: pip install -U openai-whisper
import whisper

# --- 2. CONFIGURATION ---
# Dynamically find the folder where this script lives (VideoEditorProject)
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

# Point directly to the Input and Output folders just like merge.py!
INPUT_VIDEO = os.path.join(PROJECT_DIR, "Output", "raw.mp4")
OUTPUT_VIDEO = os.path.join(PROJECT_DIR, "Final", "Final_Render.mp4")

def format_timestamp(seconds):
    """Converts seconds to the strict HH:MM:SS,mmm format required by SRT files."""
    hours = math.floor(seconds / 3600)
    seconds %= 3600
    minutes = math.floor(seconds / 60)
    seconds %= 60
    milliseconds = round((seconds - math.floor(seconds)) * 1000)
    seconds = math.floor(seconds)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"

def generate_subtitles():
    if not os.path.exists(INPUT_VIDEO):
        print(f"❌ Error: Could not find '{INPUT_VIDEO}'. Please upload a video first.")
        return

    print("🤖 Loading Whisper AI Model (this might take a moment)...")
    # 'base' is fast and good. You can change to 'small' or 'medium' for higher accuracy
    model = whisper.load_model("base") 

    print("🎧 Transcribing audio...")
    
    try:
        # Whisper automatically extracts the audio from the video and transcribes it!
        result = model.transcribe(INPUT_VIDEO)
    except Exception as e:
        # --- THE BULLETPROOF FAILSAFE ---
        print("❌ ERROR: Whisper crashed trying to read the audio!")
        print("💡 Reason: This video likely has NO AUDIO TRACK. Whisper needs sound to generate subtitles.")
        print("🎬 Bypassing AI and saving the original silent video...")
        os.makedirs(os.path.dirname(OUTPUT_VIDEO), exist_ok=True)
        shutil.copy2(INPUT_VIDEO, OUTPUT_VIDEO)
        print(f"✅ Success! Silent video passed through safely to: {OUTPUT_VIDEO}")
        return

    segments = result['segments']

    # Failsafe 2: Video has audio, but no one is talking
    if not segments:
        print("⚠️ Warning: No speech detected in the audio.")
        os.makedirs(os.path.dirname(OUTPUT_VIDEO), exist_ok=True)
        shutil.copy2(INPUT_VIDEO, OUTPUT_VIDEO)
        print(f"✅ Success! Video saved (no subtitles added): {OUTPUT_VIDEO}")
        return

    # Create a temporary SRT (Subtitle) file in the project directory
    srt_filename = os.path.join(PROJECT_DIR, "temp_subtitles.srt")
    print(f"📝 Writing subtitles to {srt_filename}...")
    
    with open(srt_filename, "w", encoding="utf-8") as srt_file:
        for i, segment in enumerate(segments):
            start_time = format_timestamp(segment['start'])
            end_time = format_timestamp(segment['end'])
            text = segment['text'].strip()
            
            # Write in standard SRT format
            srt_file.write(f"{i + 1}\n")
            srt_file.write(f"{start_time} --> {end_time}\n")
            srt_file.write(f"{text}\n\n")

    print("🎬 Burning subtitles into the video (Bottom Center)...")
    
    # We use FFmpeg to permanently "burn" the subtitles into the video.
    style = "Alignment=2,MarginV=20,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0"
    
    # --- THE WINDOWS COLON FIX ---
    # FFmpeg breaks if it sees "C:/". We MUST escape the colon to "C\:/".
    safe_srt_path = srt_filename.replace("\\", "/").replace(":", "\\:")
    
    os.makedirs(os.path.dirname(OUTPUT_VIDEO), exist_ok=True)

    ffmpeg_command = [
        "ffmpeg",
        "-y", # Overwrite output if it exists
        "-i", INPUT_VIDEO, # Input video
        "-vf", f"subtitles='{safe_srt_path}':force_style='{style}'", # Apply subtitles with styling
        "-c:a", "copy", # Keep the original audio exactly as is
        OUTPUT_VIDEO # Output file
    ]

    # Run the FFmpeg command AND CATCH ERRORS!
    process = subprocess.run(ffmpeg_command, capture_output=True, text=True)

    # Clean up the temporary subtitle text file
    if os.path.exists(srt_filename):
        os.remove(srt_filename)

    # Check if FFmpeg ACTUALLY succeeded
    if process.returncode != 0:
        print("❌ ERROR: FFmpeg failed to burn subtitles! Here is the actual error:")
        print(process.stderr)
        return

    print(f"✅ Success! Video saved to: {OUTPUT_VIDEO}")

if __name__ == "__main__":
    generate_subtitles()