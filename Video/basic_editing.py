from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.video.compositing.CompositeVideoClip import concatenate_videoclips
from moviepy.video.compositing.CompositeVideoClip import CompositeVideoClip
from moviepy.video.VideoClip import TextClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.video.io.VideoFileClip import VideoFileClip
from history_maintain import save_video_to_history as save
from effects import construct_effects # Reuse your effects logic!

def cut_video(input, start, end, output):
    clip = VideoFileClip(input).subclipped(0, start)
    clip2 = VideoFileClip(input)
    after=clip2.subclipped(end,clip2.duration)
    final=concatenate_videoclips([clip,after])
    save(final,output)
    #final.write_videofile(output, codec="libx264", audio_codec="aac")
    clip.close()
    after.close()
    final.close()
    
    
def trim(input, start, end, output):
    clip = VideoFileClip(input).subclipped(start,end)
    save(clip,output)
    #clip.write_videofile(output, codec="libx264", audio_codec="aac")
    clip.close()
#not supporting emojis  
'''def add_text(
    input,
    text,
    start,
    duration1,
    position,
    output
):
    video = VideoFileClip(input)

    txt = (
        TextClip(
            text=text,
            font_size=50,
            color="white",
            method="label",
            text_align="right",
            duration=duration1
            
        )
    )

    final = CompositeVideoClip(
    [video, txt.with_position((position))]
)
    save(final,output)
    #final.write_videofile(output, codec="libx264", audio_codec="aac")
    final.close()
    video.close()
    txt.close()
'''  
 

def add_text(input, text, output, start=0, duration1=5, font="C:/Windows/Fonts/arial.ttf", fontsize=70, color='white', position=('center', 'bottom'), text_effects=None):
    video = VideoFileClip(input)
    
    # 1. Create the TextClip
    # Note: Ensure ImageMagick is installed for TextClip to work with fonts
    txt_clip = TextClip(
        text=text, 
        font=font, 
        font_size=fontsize, 
        color=color
    )
    
    # 2. Apply "Motion" or "Transitions" to the text itself
    if text_effects:
        # We reuse the same logic from your effects.py!
        moviepy_effects = construct_effects(text_effects)
        txt_clip = txt_clip.with_effects(moviepy_effects)
    
    # 3. Set timing and position
    txt_clip = txt_clip.with_start(start).with_duration(duration1).with_position(position)
    
    # 4. Overlay onto video
    result = CompositeVideoClip([video, txt_clip])
    save(result,output)  
        
def change_speed(input,speed, output):
    clip = VideoFileClip(input)
    new_clip = clip.with_speed_scaled(speed)
    save(new_clip,output)
   # new_clip.write_videofile(output,codec="libx264",audio_codec="aac" )
    new_clip.close()
    clip.close()

    
    
def merge_videos(video_paths, output):
    clips = [VideoFileClip(v) for v in video_paths]
    final = concatenate_videoclips(clips, method="compose")
    save(final,output)
    #final.write_videofile(output, codec="libx264", audio_codec="aac")
    final.close()
    clips.close()
    
def add_audio(input,audio,output):
    video=VideoFileClip(input).with_audio(audio)
    save(video,output)

def export_clip(clip, output):
    save(clip,output)
    
