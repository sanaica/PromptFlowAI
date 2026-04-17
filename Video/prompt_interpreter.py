#take input->match the keywords and the attributes it needs-> and call the function


# gemini: give the theme
#action, time, input,output
import re
def normalize(prompt):
    return prompt.lower().strip()

def intent_finding(prompt):
    feature=["cut","trim","audio","merge","text","speed"]
    intent={
    "cut": ["cut", "remove", "delete"],
    "trim": ["trim", "keep only"],
    "merge": ["merge", "combine", "join"],
    "add_text": ["add text", "text", "caption"],
    "change_speed": ["speed", "faster", "slower"],
    "export": ["export", "render", "save"]
    }
    
   
    
    for key , value in intent:
        for i in value:
            if i in prompt:
                return key
    return None

def time_finder(prompt):
    #supoorts: 2, 2s, 02:10
     matches = re.findall(r"\d+:\d+|\d+", prompt)
     times = []

     for m in matches:
        if ":" in m:
            mins, secs = map(int, m.split(":"))
            times.append(mins * 60 + secs)
        else:
            times.append(int(m))

     return times

def action_builder(prompt):
     prompt=normalize(prompt)
     intent_action=intent_finding(prompt)
     if not intent_action :
         return {"error:": "Please Choose from the following actions only: cut,trim,audio,merge,text,speed"}
     
     time=time_finder(prompt)
     action= {"action":intent_action}
     if intent_action in ["cut", "trim"]:
        if len(time) < 2:
            return {"error": "Start and end time required"}
        action["start"] = time[0]
        action["end"] = time[1]

     return action
      

#effect detectio:

