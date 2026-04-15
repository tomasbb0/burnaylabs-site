#!/usr/bin/env python3
"""Generate Portuguese TTS MP3 files with male + female voices using Edge TTS."""
import asyncio
import edge_tts
import os

audio_dir = os.path.join(os.path.dirname(__file__), "audio")
os.makedirs(audio_dir, exist_ok=True)

FEMALE_VOICE = "pt-PT-RaquelNeural"   # "Simão diz"
MALE_VOICE = "pt-PT-DuarteNeural"     # command words

# All 17 commands (Portuguese text) — male voice
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

async def generate():
    # Female voice: "Simão diz"
    print(f"Generating: simao_diz.mp3 (female: {FEMALE_VOICE})")
    comm = edge_tts.Communicate("Simão diz", FEMALE_VOICE)
    await comm.save(os.path.join(audio_dir, "simao_diz.mp3"))

    # Male voice: each command
    for cmd_id, pt_text in commands.items():
        fname = f"{cmd_id}.mp3"
        print(f"Generating: {fname} ({pt_text}) (male: {MALE_VOICE})")
        comm = edge_tts.Communicate(pt_text, MALE_VOICE)
        await comm.save(os.path.join(audio_dir, fname))

    print(f"\nDone! Generated {len(commands) + 1} files in {audio_dir}")

asyncio.run(generate())
