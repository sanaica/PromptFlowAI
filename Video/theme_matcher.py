"CLEAN_MINIMAL"={
    "font": "Inter-Bold", # Standard 2026 sans-serif
    "color": "#FFFFFF",
    "bg_color": "#000000", # High-contrast background for text
    "align": "West",
    "transition": "simple_cut"
}

"EARTHY_LUXE"= {
    "font": "Baskerville-Italic",
    "color": "#A47864", # Mocha Mousse (Earth tone)
    "bg_color": "#F5F5F5", # Off-white
    "position": ("center", 1400),
    "transition": "fade"
}

"DIGITAL_LAVENDER"={
    "font": "Montserrat-Medium",
    "color": "#A89ACD", # Digital Lavender 2.0
    "stroke_color": "#FFFFFF",
    "stroke_width": 2,
    "method": "caption"
}
"HYPER_FAST"= {
    "font": "Impact",
    "color": "#FFDE22", # Sharp Yellow
    "stroke_color": "#000000",
    "stroke_width": 4,
    "method": "label", # Large, non-wrapping
    "position": "center"
}
"CODED_MOTION"={
    "font": "Courier-Prime",
    "color": "#00FF41", # Matrix Green
    "prefix": "root@user:~$ ",
    "bg_color": "#0D0208",
    "align": "West"
}

# The Semantic Router Map: Translating human "vibes" into hardcoded theme IDs
THEME_KEYWORDS = {
    "CLEAN_MINIMAL": [
        "professional", "corporate", "simple", "easy", "lesson", "clean", 
        "minimalist", "tutorial", "instructional", "clear", "modern"
    ],
    "EARTHY_LUXE": [
        "beach", "calm", "warm", "neutral", "organic", "luxury", "expensive", 
        "meditation", "wellness", "natural", "sunset", "soft", "elegant"
    ],
    "DIGITAL_LAVENDER": [
        "futuristic", "purple", "ai", "smart", "creative", "friendly", 
        "startup", "innovative", "dreamy", "pastel", "fresh", "gen-z"
    ],
    "HYPER_FAST": [
        "viral", "fast", "hype", "energy", "workout", "trending", "loud", 
        "exciting", "urgent", "intense", "aggresive", "stop the scroll"
    ],
    "CODED_MOTION": [
        "retro", "hacker", "matrix", "coding", "build in public", "lo-fi", 
        "green", "terminal", "linux", "command", "vintage", "geek"
    ]
}
def get_vibe_from_prompt(prompt):
    prompt = prompt.lower()
    
    # Track which theme gets the most "hits"
    scores = {theme: 0 for theme in THEME_KEYWORDS.keys()}
    
    for theme, keywords in THEME_KEYWORDS.items():
        for word in keywords:
            if word in prompt:
                scores[theme] += 1
    
    # Get the theme with the highest score
    best_match = max(scores, key=scores.get)
    
    # If no hits at all, default to CLEAN_MINIMAL
    if scores[best_match] == 0:
        return "CLEAN_MINIMAL"
        
    return best_match