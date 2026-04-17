from basic_editing import *
from music_addition import *
from effects import *

#eg1:
instructions={
  "workflow": [
    {
      "function": "cut_video",
      "params": {
        "input": "npntransistor.mp4",
        "start": 2,
        "end": 8,
        "output": "cut.mp4"
      }
    },
    {
      "function": "add_text",
      "params": {
        "input": "cut.mp4",
        "text": "BJT Logic",
        "start": 1,
        "duration1": 6,
        "position": ["center", "bottom"],
        "output": "text_video.mp4"
      }
    }
  ]
}

#eg2: "Cut the first 10 seconds of my NPN video,
# #make it double speed, and then add the text 'High Speed Flow' at the bottom for 5 seconds."
instruct2={
  "workflow": [
    {
      "step": 1,
      "function": "cut_video",
      "params": {"input": "npntransistor.mp4", "start": 0, "end": 10, "output": "temp_cut.mp4"}
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
        "output": "final_output.mp4"
      }
    }
  ]
}

# Updated JSON to accommodate multiple stacked effects
instruct2_with_effects = {
  "workflow": [
    {
      "step": 1,
      "function": "trim",
      "params": {"input": "npntransistor.mp4", "start": 0, "end": 10, "output": "temp_cut.mp4"}
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
    }
  ]
}
import json

# Sample generated JSON from the AI
#instructions = json.loads(ai_response_json)


def process_video_workflow(json_payload):
    # Convert the AI string to a Python dictionary
    data = instruct2_with_effects
    
    # Iterate through each step in the workflow
    for task in data['workflow']:
        func_name = task['function']
        args = task['params']
        
        print(f"--- 🎬 Processing Step: {func_name} ---")
        
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

process_video_workflow(instructions)