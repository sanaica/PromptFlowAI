from moviepy import VideoFileClip 
import moviepy.video.fx as vfx
from history_maintain import save_video_to_history as save 

'''
EFFECT_MAP = {
    "fade_in": vfx.FadeIn,
    "fade_out": vfx.FadeOut,
    "bw": vfx.BlackAndWhite,
    "mirror": vfx.MirrorX,
    "invert": vfx.InvertColors,
    "speed": vfx.MultiplySpeed
}



def construct_effects(prompt_data):
    """
    prompt_data: A list of dicts from Gemini like:
    [{'type': 'fade_in', 'val': 1.5}, {'type': 'bw'}]
    """
    final_effects = []
    
    for item in prompt_data:
        effect_type = item['type']
        if effect_type in EFFECT_MAP:
            # Get the Class from our dictionary
            EffectClass = EFFECT_MAP[effect_type]
            
            # Instantiate it with the value (if provided)
            if 'val' in item:
                final_effects.append(EffectClass(item['val']))
            else:
                final_effects.append(EffectClass())
                
    return final_effects

def effects(file,promt):
    video=VideoFileClip(file)

# You have to wrap the clip in the function
    video_with_fade = video.with_effects(construct_effects(promt))
    save(video_with_fade, "edited.mp4")
'''

# Comprehensive Mapping based on the documentation provided
EFFECT_MAP = {
    "accel_decel": vfx.AccelDecel,
    "bw": vfx.BlackAndWhite,
    "blink": vfx.Blink,
    "crop": vfx.Crop,
    "crossfade_in": vfx.CrossFadeIn,
    "crossfade_out": vfx.CrossFadeOut,
    "fade_in": vfx.FadeIn,
    "fade_out": vfx.FadeOut,
    "freeze": vfx.Freeze,
    "gamma": vfx.GammaCorrection,
    "invert": vfx.InvertColors,
    "loop": vfx.Loop,
    "lum_contrast": vfx.LumContrast,
    "margin": vfx.Margin,
    "mirror_x": vfx.MirrorX,
    "mirror_y": vfx.MirrorY,
    "multiply_color": vfx.MultiplyColor,
    "speed": vfx.MultiplySpeed,
    "painting": vfx.Painting,
    "resize": vfx.Resize,
    "rotate": vfx.Rotate,
    "scroll": vfx.Scroll,
    "slide_in": vfx.SlideIn,
    "slide_out": vfx.SlideOut,
    "time_mirror": vfx.TimeMirror,
    "time_symmetrize": vfx.TimeSymmetrize
}

def construct_effects(effect_list):
    """
    Transforms JSON dictionaries into fully-attributed MoviePy effect instances.
    """
    final_effects = []
    
    for item in effect_list:
        etype = item.get('type')
        if etype in EFFECT_MAP:
            # We collect all attributes except 'type'
            # e.g., {"type": "rotate", "angle": 45, "center": [10, 10]}
            attributes = {k: v for k, v in item.items() if k != 'type'}
            
            EffectClass = EFFECT_MAP[etype]
            
            try:
                # This 'unpacks' the attributes directly into the class constructor
                instance = EffectClass(**attributes)
                final_effects.append(instance)
                print(f"✅ Applied {etype} with attributes: {attributes}")
            except TypeError as e:
                print(f"❌ Parameter Error in {etype}: {e}")
                
    return final_effects

def apply_effects(input, effect_list, output):
    """
    Standardized entry point for the main program
    """
    video = VideoFileClip(input)
    
    # Generate the list of MoviePy effect objects
    moviepy_effects = construct_effects(effect_list)
    
    # Apply them using the MoviePy 2.0+ 'with_effects' syntax
    processed_video = video.with_effects(moviepy_effects)
    
    # Using write_videofile directly or your custom save()
    processed_video.write_videofile(output)
    # save(processed_video, output_file)