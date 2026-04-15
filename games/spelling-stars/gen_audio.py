#!/usr/bin/env python3
"""Generate pre-recorded Portuguese word audio using Microsoft Neural TTS.
Uses pt-PT-RaquelNeural — a warm, natural female voice perfect for kids.
"""
import asyncio
import os
import edge_tts

# Voice: pt-PT-RaquelNeural (warm, natural Portuguese female)
VOICE = "pt-PT-RaquelNeural"
RATE = "-10%"  # Slightly slower for child learners
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "audio")

# All Portuguese words from Spelling Stars CATEGORIES
WORDS = [
    # Colors
    "vermelho", "azul", "amarelo", "verde", "laranja", "roxo", "rosa", "preto", "branco",
    # Numbers
    "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez",
    # Commands
    "olha", "ouve", "salta", "senta-te", "levanta-te", "come", "bebe", "dorme", "brinca",
    # Greetings
    "olá", "bom dia", "boa noite", "adeus", "obrigado", "sim", "não",
    # Objects
    "livro", "lápis", "bola", "cadeira",
    # Actions
    "comer", "beber", "dormir", "brincar",
    # Family
    "mãe", "pai", "avó", "avô", "bebé", "irmão", "irmã",
    # Animals
    "gato", "cão", "cavalo", "vaca", "leão", "peixe",
    # Food
    "banana", "água", "gelado", "pão", "leite",
]

def word_to_filename(word):
    """Convert word to safe filename."""
    return word.replace(" ", "_").replace("-", "_").lower() + ".mp3"

async def generate_audio(word):
    """Generate MP3 for a single word."""
    filename = word_to_filename(word)
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    if os.path.exists(filepath):
        print(f"  ✓ {word} (already exists)")
        return
    
    communicate = edge_tts.Communicate(word, VOICE, rate=RATE)
    await communicate.save(filepath)
    size_kb = os.path.getsize(filepath) / 1024
    print(f"  ✅ {word} → {filename} ({size_kb:.1f} KB)")

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generating {len(WORDS)} Portuguese word audio files...")
    print(f"Voice: {VOICE}")
    print(f"Output: {OUTPUT_DIR}\n")
    
    for word in WORDS:
        try:
            await generate_audio(word)
        except Exception as e:
            print(f"  ❌ {word}: {e}")
    
    # Count files
    files = [f for f in os.listdir(OUTPUT_DIR) if f.endswith('.mp3')]
    total_size = sum(os.path.getsize(os.path.join(OUTPUT_DIR, f)) for f in files)
    print(f"\nDone! {len(files)} files, {total_size/1024:.0f} KB total")

if __name__ == "__main__":
    asyncio.run(main())
