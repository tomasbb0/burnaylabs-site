#!/usr/bin/env python3
"""Generate Portuguese TTS MP3 files for Simon Says game."""
from gtts import gTTS
import os

audio_dir = os.path.join(os.path.dirname(__file__), "audio")
os.makedirs(audio_dir, exist_ok=True)

# "Simão diz:" prefix
print("Generating: simao_diz.mp3")
tts = gTTS("Simão diz", lang="pt", tld="pt")
tts.save(os.path.join(audio_dir, "simao_diz.mp3"))

# All 17 commands (Portuguese text)
commands = {
    "jump": "Salta!",
    "clap": "Bate palmas!",
    "dance": "Dança!",
    "sit": "Senta-te!",
    "spin": "Roda!",
    "wave": "Acena!",
    "laugh": "Ri-te!",
    "sing": "Canta!",
    "whisper": "Sussurra!",
    "nose": "Toca no nariz!",
    "eyes": "Toca nos olhos!",
    "hand": "Levanta a mão!",
    "stomp": "Bate o pé!",
    "fly": "Faz de avião!",
    "run": "Corre!",
    "stretch": "Estica-te!",
    "blow": "Sopra!",
}

for cmd_id, pt_text in commands.items():
    fname = f"{cmd_id}.mp3"
    print(f"Generating: {fname} ({pt_text})")
    tts = gTTS(pt_text, lang="pt", tld="pt")
    tts.save(os.path.join(audio_dir, fname))

print(f"\nDone! Generated {len(commands) + 1} files in {audio_dir}")
