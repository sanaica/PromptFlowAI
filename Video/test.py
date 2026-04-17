from basic_editing import *
from music_addition import *
from effects import *

#cut_video("npntransistor.mp4", 2, 8, "cut.mp4")

#syntax: input, start,end,outputfile

cut_video(
    "npntransistor.mp4",
    start=1,
    end=6,
    output="slowoutput.mp4"
)
#add_audio("slow.mp4", "hbd.mp3", "with_audio.mp4")
#change_speed("npntransistor.mp4", 2.0, "fast.mp4")   # 2x faster
#change_speed("text.mp4", 0.5, "slow.mp4")   # half speed
#merge_videos(["text.mp4","fast.mp4"], "merged.mp4")
#integrate_music("loud rockandroll angry","text.mp4")
#no audio:
#no_audio("final.mp4")
fade_in("final.mp4",[{"type":"fade_out","val":3.0},{"type":"bw"}])
