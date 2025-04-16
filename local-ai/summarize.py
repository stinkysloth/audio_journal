"""
Summarize a transcript using a local LLM (GPT4All or llama.cpp).
Usage: python summarize.py <transcript_file_path>
"""
import sys
from pathlib import Path

# Placeholder: Replace with actual GPT4All or llama.cpp integration
# For now, return a mock summary for testing

def summarize(text: str) -> str:
    # Replace with actual call to local LLM
    return f"Summary: {text[:80]}..."

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python summarize.py <transcript_file_path>", file=sys.stderr)
        sys.exit(1)
    transcript_file = Path(sys.argv[1])
    if not transcript_file.exists():
        print(f"File not found: {transcript_file}", file=sys.stderr)
        sys.exit(1)
    text = transcript_file.read_text(encoding='utf-8')
    summary = summarize(text)
    print(summary)
