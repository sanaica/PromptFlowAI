import os
import shutil
from basic_editing import *
from music_addition import *
from effects import *
from history_maintain import determine_path


instruct2_with_effects = {
  "workflow": [
    {
      "step": 1,
      "function": "trim",
      "params": {"input": "bean.mp4", "start": 0, "end": 40, "output": "temp_cut.mp4"}
    },
    {
      "step": 2,
      "function": "change_speed",
      "params": {"input": "temp_cut.mp4", "speed": 2.0, "output": "temp_fast.mp4"}
    },
    {
      "step": 3,
      "function": "add_text",
      "params": {
        "input": "temp_fast.mp4", 
        "text": "High Speed Flow", 
        "start": 0, 
        "duration1": 5, 
        "position": ["center", "bottom"], 
        "output": "temp_text.mp4"
      }
    },
    {
      "step": 4,
      "function": "apply_effects",
      "params": {
        "input": "temp_text.mp4",
        "output": "final_output.mp4",
        "effect_list": [
          {"type": "bw"},
          {"type": "fade_out", "duration": 2.0},
          {"type": "rotate", "angle": 10}
        ]
      }
    },
    { "step":5,
        "function": "integrate_music",
      "params": {
        "user_desc":"boy laughing loudly",
        "input": "final_output.mp4",
        "output": "musicre.mp4"
    
      }
        
    }
  ]
}
# 1. Define Directories
def process_video_workflow(data):
    workflow = data['workflow']
    total_steps = len(workflow)
    
    for i, task in enumerate(workflow):
        step_num = i + 1
        is_last_step = (step_num == total_steps)
        
        func_name = task['function']
        args = task['params'].copy() 

        # --- THE PATH ENGINE ---
        # The input is either a raw file (Input) or a previous step's result (Temp)
        if 'input' in args:
            args['input'] = determine_path(args['input'])
            
        # The output is either a Temp file or the Final Master (History)
        if 'output' in args:
            args['output'] = determine_path(args['output'], is_final=is_last_step)
        
        # Audio assets are almost always raw sources from the Input folder
        if 'audio_path' in args:
            args['audio_path'] = determine_path(args['audio_path'])

        print(f"--- 🎬 Step {step_num}: {func_name} ---")
        print(f"🎬 Processing: {os.path.basename(args['input'])} -> 📂 Saving to: {args['output']}")

        # --- EXECUTION ---
        '''if func_name == "cut_video":
            cut_video(**args)
        elif func_name == "trim":
            trim(**args)
        elif func_name == "add_text":
            add_text(**args)
        elif func_name == "apply_effects":
            apply_effects(input=args['input'], effect_list=args['effect_list'], output=args['output'])
        elif func_name == "change_speed":
            change_speed(**args)
        else:
            print(f"⚠️ Warning: {func_name} not recognized.")'''
        # 1. The IF-ELSE Dispatcher
        if func_name == "cut_video":
            # Removes a middle section and stitches ends
            cut_video(**args)
            
        elif func_name == "trim":
            # Keeps ONLY the middle section
            trim(**args)
            
        elif func_name == "add_text":
            # Overlays text on top of the video
            add_text(**args)
            
        elif func_name == "add_audio":
            # Merges a specific audio file with video
            add_audio(**args)
            
        elif func_name == "change_speed":
            # Speeds up or slows down the video
            change_speed(**args)
            
        elif func_name == "merge_videos":
            # Joins multiple clips into one
            merge_videos(**args)
            
        elif func_name == "integrate_music":
            # AI-based music search and addition
            integrate_music(**args)
            
        elif func_name == "no_audio":
            # Mutes the video entirely
            no_audio(**args)
            
        elif func_name == "apply_effects":
            # This replaces the old 'effects' block
            # Pass the input, the list of effects, and the output filename
            apply_effects(
                input=args['input'],
                effect_list=args['effect_list'],
                output=args['output']
            )
        
        else:
            print(f"❌ Error: Function '{func_name}' not recognized.")
        
    
    print(f"\n✅ Pipeline Complete! Final video is in 'history'.")
'''
def process_video_workflow(data):
    workflow = data['workflow']
    total_steps = len(workflow)
    
    for i, task in enumerate(workflow):
        step_num = i + 1
        func_name = task['function']
        args = task['params'].copy()
        
        # Identify if this is the very last step in the JSON
        is_last_step = (step_num == total_steps)
        
        print(f"--- 🎬 Step {step_num}/{total_steps}: {func_name} ---")
        
        # 1. The IF-ELSE Dispatcher
        if func_name == "cut_video":
            # Removes a middle section and stitches ends
            cut_video(**args)
            
        elif func_name == "trim":
            # Keeps ONLY the middle section
            trim(**args)
            
        elif func_name == "add_text":
            # Overlays text on top of the video
            add_text(**args)
            
        elif func_name == "add_audio":
            # Merges a specific audio file with video
            add_audio(**args)
            
        elif func_name == "change_speed":
            # Speeds up or slows down the video
            change_speed(**args)
            
        elif func_name == "merge_videos":
            # Joins multiple clips into one
            merge_videos(**args)
            
        elif func_name == "integrate_music":
            # AI-based music search and addition
            integrate_music(**args)
            
        elif func_name == "no_audio":
            # Mutes the video entirely
            no_audio(**args)
            
        elif func_name == "apply_effects":
            # This replaces the old 'effects' block
            # Pass the input, the list of effects, and the output filename
            apply_effects(
                input_file=args['input'],
                effect_list=args['effect_list'],
                output_file=args['output']
            )
        
        else:
            print(f"❌ Error: Function '{func_name}' not recognized.")

    print("\n✅ All edits complete. Final file exported.")


    print(f"\n✅ Done! Intermediate files are in '{TEMP_DIR}'.")
    print(f"🌟 Final export saved to: '{HISTORY_DIR}'")

    # Optional: Auto-cleanup temp folder after success
    # shutil.rmtree(TEMP_DIR)
    # os.makedirs(TEMP_DIR)
    
 '''   
    
#calling
#process_video_workflow(instruct2_with_effects)

#calling
if __name__ == "__main__":
    process_video_workflow(instruct2_with_effects)