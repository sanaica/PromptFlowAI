import sys
import os
import math
import json
import io

# --- 1. BRIDGE ---
# Force UTF-8 encoding so emojis/special characters don't crash Windows CMD
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Dynamically find the current user's AppData folder!
user_home = os.path.expanduser("~")
user_libraries = os.path.join(user_home, "AppData", "Roaming", "Python", "Python313", "site-packages")
if user_libraries not in sys.path:
    sys.path.append(user_libraries)

import PIL.Image
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.LANCZOS

from moviepy.editor import VideoFileClip, CompositeVideoClip, vfx, concatenate_videoclips

# --- 2. CONFIGURATION ---
# Dynamically find the folder where this script lives
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

MAIN_VIDEO_PATH = os.path.join(PROJECT_DIR, "Output", "raw.mp4")
EFFECT_VIDEO_PATH = os.path.join(PROJECT_DIR, "Gen", "vidgenerated.mp4")
OUTPUT_FILE = os.path.join(PROJECT_DIR, "Final", "Final_Render.mp4")
PROMPT_FILE = os.path.join(PROJECT_DIR, "Prompt", "prompt.txt")

def merge_videos():
    print("Starting Smart AI VFX Merge...")

    try:
        # --- NEW: PARSE ALL AI JSON PARAMETERS ---
        ai_params = {
            "width": 0,
            "height": 0,
            "scale": 1.0,
            "start_time": 0,
            "end_time": 0,
            "position": "center"
        }
        
        if os.path.exists(PROMPT_FILE):
            with open(PROMPT_FILE, "r", encoding="utf-8") as f:
                raw_text = f.read().strip()
                
                # Clean markdown if Gemini added it
                if raw_text.startswith("```"):
                    raw_text = raw_text.strip("`").strip()
                    if raw_text.lower().startswith("json"):
                        raw_text = raw_text[4:].strip()
                
                try:
                    data = json.loads(raw_text)
                    print("Successfully Loaded AI VFX Instructions!")
                    ai_params["width"] = data.get("width", 0)
                    ai_params["height"] = data.get("height", 0)
                    ai_params["scale"] = data.get("scale", 1.0)
                    ai_params["start_time"] = data.get("start_time", 0)
                    ai_params["end_time"] = data.get("end_time", 0)
                    ai_params["position"] = data.get("position", "center")
                except Exception as e:
                    print(f"Warning: Could not parse JSON, using defaults. Error: {e}")

        # --- LOAD VIDEOS ---
        print("Loading videos...")
        
        # Load clips with explicit fps from the beginning to prevent early None propagation
        clip_main = VideoFileClip(MAIN_VIDEO_PATH)
        if hasattr(clip_main, 'set_fps'): clip_main = clip_main.set_fps(24)
        clip_main.fps = 24
        
        clip_effect = VideoFileClip(EFFECT_VIDEO_PATH, audio=False)
        if hasattr(clip_effect, 'set_fps'): clip_effect = clip_effect.set_fps(24)
        clip_effect.fps = 24
        
        # --- THE ULTIMATE NONETYPE FIX ---
        eff_dur = clip_effect.duration if clip_effect.duration else 5.0
        clip_effect = clip_effect.set_duration(eff_dur)
            
        main_dur = clip_main.duration if clip_main.duration else (clip_main.reader.duration if clip_main.reader.duration else 10.0)
        clip_main = clip_main.set_duration(main_dur)

        # --- APPLY TIMING FROM JSON ---
        start_t = ai_params["start_time"]
        end_t = ai_params["end_time"]
        
        # ---> THE FIX: If end_t is 0 or None, loop until the end of the main video! <---
        if end_t and end_t > start_t:
            target_duration = end_t - start_t
        else:
            target_duration = main_dur - start_t

        target_duration = float(target_duration)

        # Loop the effect video if it is shorter than our target duration
        if clip_effect.duration < target_duration:
            print("Looping effect to match desired duration...")
            repeats = math.ceil(target_duration / clip_effect.duration)
            clip_effect = concatenate_videoclips([clip_effect] * repeats)
        
        # Trim off any excess and place it on the timeline
        clip_effect = clip_effect.subclip(0, target_duration)
        clip_effect = clip_effect.set_start(start_t)

        # --- APPLY SIZE & SCALE ENGINE ---
        print("Applying size and scale...")
        w = ai_params["width"]
        h = ai_params["height"]
        scale = ai_params["scale"]
        
        # If AI passes floats (like 0.5), mathematically convert to % of main screen size
        if isinstance(w, float) and 0 < w <= 1.0: w = int(clip_main.w * w)
        if isinstance(h, float) and 0 < h <= 1.0: h = int(clip_main.h * h)
        
        # 1. Prioritize Explicit Dimensions
        if w > 0 and h > 0:
            clip_effect = clip_effect.resize(newsize=(w, h))
        elif w > 0:
            clip_effect = clip_effect.resize(width=w)
        elif h > 0:
            clip_effect = clip_effect.resize(height=h)
        # 2. Fallback to Scale Multiplier
        else:
            # Stretch effect to full screen first, then shrink by scale factor
            clip_effect = clip_effect.resize(newsize=clip_main.size)
            if scale != 1.0:
                clip_effect = clip_effect.resize(scale)

        # --- CHROMA KEY ---
        print("Removing black background...")
        clip_effect = clip_effect.fx(vfx.mask_color, color=[0, 0, 0], thr=50, s=10)
        
        # --- POSITION ---
        pos = ai_params["position"]
        pos_map = {
            "center": ("center", "center"),
            "top-left": ("left", "top"),
            "top-right": ("right", "top"),
            "bottom-left": ("left", "bottom"),
            "bottom-right": ("right", "bottom"),
            "top": ("center", "top"),
            "bottom": ("center", "bottom")
        }
        # Look up coordinates or default to center
        clip_effect = clip_effect.set_pos(pos_map.get(pos, ("center", "center")))

        # --- RENDER ---
        print("Layering videos...")
        final_clip = CompositeVideoClip([clip_main, clip_effect])
        
        # Double insurance
        if hasattr(final_clip, 'set_fps'):
            final_clip = final_clip.set_fps(24)
        final_clip.fps = 24

        final_clip = final_clip.set_duration(main_dur)
        
        if clip_main.audio:
            safe_audio = clip_main.audio.set_duration(main_dur)
            final_clip = final_clip.set_audio(safe_audio)

        print(f"Saving to: {OUTPUT_FILE}")
        
        # --- THE BULLETPROOF PYTHON 3.13 DECORATOR BYPASS ---
        print("Bypassing broken MoviePy decorators...")
        from moviepy.video.VideoClip import VideoClip
        
        raw_write = VideoClip.write_videofile
        
        # Peel off the broken decorators one by one
        while hasattr(raw_write, '__wrapped__'):
            raw_write = raw_write.__wrapped__
            
        print("Executing pure write_videofile...")
        raw_write(
            final_clip,           
            filename=OUTPUT_FILE, 
            fps=24,               
            codec="libx264", 
            audio_codec="aac",
            preset='ultrafast',
            threads=4,
            logger='bar'
        )
        print("DONE! Video created successfully.")

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'clip_main' in locals(): clip_main.close()
        if 'clip_effect' in locals(): clip_effect.close()
        if 'final_clip' in locals(): final_clip.close()

if __name__ == "__main__":
    merge_videos()