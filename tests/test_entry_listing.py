import os
import shutil
import tempfile
import json
import pytest
import sys
from pathlib import Path

# Import the Node.js entry listing logic via subprocess
import subprocess

def create_entry_set(tmpdir, count=3):
    entries_dir = tmpdir / "entries"
    entries_dir.mkdir()
    for i in range(count):
        audio = entries_dir / f"entry{i}.webm"
        transcript = entries_dir / f"entry{i}.txt"
        md = entries_dir / f"entry{i}.md"
        audio.write_bytes(b"FAKEAUDIO")
        transcript.write_text(f"Transcript {i}")
        md.write_text(f"---\ntitle: Entry {i}\ndate: 2025-04-1{i}\ntags: [test, sample]\nsummary: This is summary {i}\n---\n\n**Summary:**\nThis is summary {i}\n\n**Transcript:**\nTranscript {i}\n")
    return entries_dir

def test_entry_listing(tmp_path):
    entries_dir = create_entry_set(tmp_path)
    # Copy entries.js and constants.js into tmp_path
    app_dir = Path(__file__).parent.parent / "app"
    shutil.copy(app_dir / "entries.js", tmp_path / "entries.js")
    shutil.copy(app_dir / "constants.js", tmp_path / "constants.js")
    # Patch ENTRIES_DIR in constants.js
    const_path = tmp_path / "constants.js"
    content = const_path.read_text()
    content = content.replace('ENTRIES_DIR = path.join(__dirname, "../entries")', f'ENTRIES_DIR = "{str(entries_dir)}"')
    const_path.write_text(content)
    # Run Node.js script to list entries
    node_script = f"const {{ listEntries }} = require('./entries'); console.log(JSON.stringify(listEntries()));"
    result = subprocess.run([
        "node", "-e", node_script
    ], cwd=tmp_path, capture_output=True, text=True)
    assert result.returncode == 0
    data = json.loads(result.stdout)
    assert len(data) == 3
    for i, entry in enumerate(data):
        assert entry['audio'].endswith(f"entry{i}.webm")
        assert entry['transcript'].endswith(f"entry{i}.txt")
        assert entry['summary'] == f"This is summary {i}"
        assert 'test' in entry['tags']
        assert 'sample' in entry['tags']
        assert entry['date'] == f"2025-04-1{i}"
        assert entry['transcriptSnippet'].startswith("Transcript")

def test_entry_listing_empty(tmp_path):
    entries_dir = tmp_path / "entries"
    entries_dir.mkdir()
    app_dir = Path(__file__).parent.parent / "app"
    shutil.copy(app_dir / "entries.js", tmp_path / "entries.js")
    shutil.copy(app_dir / "constants.js", tmp_path / "constants.js")
    const_path = tmp_path / "constants.js"
    content = const_path.read_text()
    content = content.replace('ENTRIES_DIR = path.join(__dirname, "../entries")', f'ENTRIES_DIR = "{str(entries_dir)}"')
    const_path.write_text(content)
    node_script = f"const {{ listEntries }} = require('./entries'); console.log(JSON.stringify(listEntries()));"
    result = subprocess.run([
        "node", "-e", node_script
    ], cwd=tmp_path, capture_output=True, text=True)
    assert result.returncode == 0
    data = json.loads(result.stdout)
    assert data == []
