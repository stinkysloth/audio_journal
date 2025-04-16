"""
Export a journal entry to Obsidian-compatible Markdown.
- Copies audio and transcript to vault attachments.
- Creates a Markdown file with front matter, embedded audio, transcript, summary, and tags.
"""
import sys
import shutil
from pathlib import Path
import json
from datetime import datetime

def load_vault_path():
    cfg = Path(__file__).parent / 'config.json'
    if not cfg.exists():
        raise RuntimeError(f"Vault config not found: {cfg}")
    with open(cfg) as f:
        return json.load(f)["vault_path"]

def export_to_obsidian(audio_path, transcript_path, summary, tags=None):
    vault_path = Path(load_vault_path())
    attachments = vault_path / 'attachments'
    attachments.mkdir(exist_ok=True)

    # Copy audio and transcript
    audio_dest = attachments / Path(audio_path).name
    transcript_dest = attachments / Path(transcript_path).name
    shutil.copy(audio_path, audio_dest)
    shutil.copy(transcript_path, transcript_dest)

    # Markdown file
    date_str = datetime.now().strftime('%Y-%m-%d')
    title = f"Audio Journal Entry {date_str}"
    md_name = f"audio-journal-{date_str}-{Path(audio_path).stem}.md"
    md_path = vault_path / md_name
    tags_str = ' '.join(f'#{t}' for t in (tags or []))
    front_matter = f"""---
title: {title}
date: {date_str}
tags: [audiojournal, summarized{',' + ','.join(tags) if tags else ''}]
---
"""
    md_content = (
        front_matter +
        f"\n![[attachments/{audio_dest.name}]]\n\n" +
        f"**Summary:**\n{summary}\n\n" +
        f"**Transcript:**\n\n![[attachments/{transcript_dest.name}]]\n\n" +
        tags_str
    )
    md_path.write_text(md_content, encoding='utf-8')

    # --- Master Index Update ---
    index_path = vault_path / 'Audio Journal Index.md'
    entry_link = f"[[{md_path.stem}]]"
    if index_path.exists():
        lines = index_path.read_text(encoding='utf-8').splitlines()
        # Avoid duplicate links
        if entry_link in lines:
            lines.remove(entry_link)
        # Insert at top after title (if present)
        for i, line in enumerate(lines):
            if line.strip().startswith('#'):
                lines.insert(i+1, entry_link)
                break
        else:
            lines.insert(0, entry_link)
    else:
        # Create new index
        lines = ["# Audio Journal Index", "", entry_link]
    index_path.write_text('\n'.join(lines) + '\n', encoding='utf-8')

    return str(md_path)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python markdown_export.py <audio_path> <transcript_path> <summary> [tag1 tag2 ...]", file=sys.stderr)
        sys.exit(1)
    audio_path = sys.argv[1]
    transcript_path = sys.argv[2]
    summary = sys.argv[3]
    tags = sys.argv[4:]
    out_path = export_to_obsidian(audio_path, transcript_path, summary, tags)
    print(out_path)
