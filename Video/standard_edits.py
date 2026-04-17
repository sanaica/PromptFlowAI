import sys
import io
import os
import shutil
import json
import traceback

# 1. Force UTF-8 encoding for n8n logs
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 2. Define Paths Dynamically (Universal)
# This automatically finds the folder the script is currently sitting in
FRIENDS_FOLDER = os.path.dirname(os.path.abspath(__file__))

# This goes up one folder level ("..") and finds "VideoEditorProject" sitting next to it
VIDEO_EDITOR_PROJECT = os.path.abspath(os.path.join(FRIENDS_FOLDER, "..", "VideoEditorProject"))

if FRIENDS_FOLDER not in sys.path:
    sys.path.append(FRIENDS_FOLDER)

from test3 import process_video_workflow

def extract_gemini_text(obj):
    """HEAT-SEEKING UNPACKER"""
    if isinstance(obj, dict):
        if "content" in obj and isinstance(obj["content"], dict):
            if "parts" in obj["content"] and isinstance(obj["content"]["parts"], list):
                if len(obj["content"]["parts"]) > 0 and "text" in obj["content"]["parts"][0]:
                    return obj["content"]["parts"][0]["text"]
        for v in obj.values():
            result = extract_gemini_text(v)
            if result: return result
    elif isinstance(obj, list):
        for item in obj:
            result = extract_gemini_text(item)
            if result: return result
    return None

def main():
    raw_video_path = os.path.join(VIDEO_EDITOR_PROJECT, "Output", "raw.mp4")
    input_folder = os.path.join(FRIENDS_FOLDER, "input_folder")
    history_folder = os.path.join(FRIENDS_FOLDER, "history")
    final_render_path = os.path.join(VIDEO_EDITOR_PROJECT, "Final", "Final_Render.mp4")
    
    # ---> UPDATED TO READ FROM information.txt <---
    workflow_json_path = os.path.join(FRIENDS_FOLDER, "information.txt")

    os.makedirs(input_folder, exist_ok=True)
    os.makedirs(os.path.dirname(final_render_path), exist_ok=True)

    if os.path.exists(raw_video_path):
        shutil.copy2(raw_video_path, os.path.join(input_folder, "raw.mp4"))
    
    try:
        with open(workflow_json_path, 'r', encoding='utf-8') as f:
            raw_content = f.read().strip()

        # Clean markdown and rogue \n characters from raw file
        raw_content = raw_content.replace('\\n', '\n')
        if raw_content.startswith("```"):
            raw_content = raw_content.strip("`").strip()
            if raw_content.lower().startswith("json"):
                raw_content = raw_content[4:].strip()

        data = json.loads(raw_content)

        # Envelope Unpacker
        hidden_text = extract_gemini_text(data)
        if hidden_text:
            hidden_text = hidden_text.replace('\\n', '\n') # Strip n8n formatting
            hidden_text = hidden_text.strip("`").strip()
            if hidden_text.lower().startswith("json"):
                hidden_text = hidden_text[4:].strip()
            data = json.loads(hidden_text)

        # Structure fixes
        if isinstance(data, list) and len(data) > 0 and "workflow" in data[0]:
            data = data[0]
        elif isinstance(data, list):
            data = {"workflow": data}
        if "workflow" in data and isinstance(data["workflow"], dict):
            data["workflow"] = [data["workflow"]]

        # Master Parameter Auto-Corrector
        if "workflow" in data:
            for task in data["workflow"]:
                
                # Catch the { "func_name": {params} } structure trap
                keys = list(task.keys())
                if "function" not in task and len(keys) == 1 and isinstance(task[keys[0]], dict):
                    func_name = keys[0]
                    params_dict = task[func_name]
                    task.clear()
                    task["function"] = func_name
                    task["params"] = params_dict
                    print(f"Notice: Auto-corrected Gemini's custom dict structure for '{func_name}'")

                # 1. Fix function names
                if isinstance(task, dict) and "function" not in task:
                    if "action" in task: task["function"] = task.pop("action")
                    elif "name" in task: task["function"] = task.pop("name")
                    elif "step_type" in task: task["function"] = task.pop("step_type")

                # 2. Fix "parameters" vs "params"
                if "parameters" in task:
                    task["params"] = task.pop("parameters")
                    print("Notice: Auto-corrected 'parameters' to 'params'")

                # 3. Fix specific function arguments to perfectly match test3.py
                params = task.get("params", {})
                func = task.get("function", "")
                
                if func == "change_speed" and "factor" in params:
                    params["speed"] = params.pop("factor")
                elif func == "add_audio" and "audio_file" in params:
                    params["audio"] = params.pop("audio_file")
                    
                # ---> MAPS AI PROMPT DIRECTLY TO YOUR FRIEND'S 'user_desc' <---
                elif func == "integrate_music":
                    if "query" in params: params["user_desc"] = params.pop("query")
                    elif "search" in params: params["user_desc"] = params.pop("search")
                    elif "prompt" in params: params["user_desc"] = params.pop("prompt")
                    
                elif func == "add_text" and "duration" in params:
                    params["duration1"] = params.pop("duration")
                elif func == "apply_effects" and "effects" in params:
                    params["effect_list"] = params.pop("effects")
                elif func == "merge_videos" and "input" in params:
                    val = params.pop("input")
                    params["inputs"] = val if isinstance(val, list) else [val]

        print(f"--- DEBUG: Final Clean JSON sent to Engine ---\n{json.dumps(data, indent=2)}\n-----------------------------")

    except Exception as e:
        print(f"Error reading or decoding information.txt: {e}")
        sys.exit(1)

    try:
        print("Starting video processing workflow...")
        process_video_workflow(data) 
        print("Video processing completed.")
    except Exception as e:
        print(f"Error during video processing: {e}")
        print(traceback.format_exc())
        with open("error_log.json", "w") as f:
            json.dump({"status": "failed", "error": str(e)}, f)
        sys.exit(1)
        
    final_output_name = "final_render.mp4" 
    history_file = os.path.join(history_folder, final_output_name)
    
    if os.path.exists(history_file):
        shutil.copy2(history_file, final_render_path)
        print(f"✅ Successfully copied final video to {final_render_path}")
    else:
        print(f"❌ Error: Could not locate {history_file} in history folder.")
        error_msg = f"CRITICAL ERROR: Could not locate {history_file} in history folder."
               
        # Optional: Write error to a JSON file for n8n to read
        with open(os.path.join(FRIENDS_FOLDER, "error_status.json"), "w") as f:
            json.dump({"error": error_msg, "status": "failed"}, f)
            
        sys.exit(1)

if __name__ == "__main__":
    os.chdir(FRIENDS_FOLDER)
    main()