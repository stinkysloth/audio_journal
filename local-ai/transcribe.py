"""
Transcribe an audio file using OpenAI Whisper (local).
Usage: python transcribe.py <audio_file_path>
"""
import sys
from pathlib import Path

try:
    import whisper
except ImportError:
    print("ERROR: whisper package not installed. Run 'pip install openai-whisper'.", file=sys.stderr)
    sys.exit(1)

def transcribe(audio_path: str) -> str:
    model = whisper.load_model("base")  # Use 'base' for speed, can upgrade later
    result = model.transcribe(audio_path)
    return result["text"].strip()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <audio_file_path>", file=sys.stderr)
        sys.exit(1)
    audio_file = Path(sys.argv[1])
    if not audio_file.exists():
        print(f"File not found: {audio_file}", file=sys.stderr)
        sys.exit(1)
    transcript = transcribe(str(audio_file))
    print(transcript)
