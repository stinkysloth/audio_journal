import tempfile
from pathlib import Path
import subprocess
import shutil
import json
import os

def setup_vault(tmp_path):
    vault = tmp_path / "vault"
    vault.mkdir()
    attachments = vault / "attachments"
    attachments.mkdir()
    config = tmp_path / "config.json"
    config.write_text(json.dumps({"vault_path": str(vault)}))
    return vault, attachments, config

def test_export_to_obsidian(tmp_path):
    # Create dummy audio and transcript
    audio = tmp_path / "entry1.webm"
    transcript = tmp_path / "entry1.txt"
    audio.write_bytes(b"FAKEAUDIO")
    transcript.write_text("This is a transcript.")
    summary = "A summary of the entry."
    vault, attachments, config = setup_vault(tmp_path)
    # Copy markdown_export.py to temp
    script = tmp_path / "markdown_export.py"
    orig = Path(__file__).parent.parent / "obsidian-sync" / "markdown_export.py"
    shutil.copy(orig, script)
    # Run export
    result = subprocess.run([
        "python3", str(script), str(audio), str(transcript), summary, "growth", "reflection"],
        env={"PYTHONPATH": str(tmp_path), **dict(**os.environ,)},
        capture_output=True, text=True
    )
    assert result.returncode == 0
    out_path = Path(result.stdout.strip())
    assert out_path.exists()
    md = out_path.read_text()
    assert "audio-journal" in md
    assert "A summary of the entry." in md
    assert "![[attachments/entry1.webm]]" in md
    assert "![[attachments/entry1.txt]]" in md
    assert "#growth" in md and "#reflection" in md
    # Check attachments copied
    assert (attachments / "entry1.webm").exists()
    assert (attachments / "entry1.txt").exists()

def test_export_missing_config(tmp_path):
    # Should fail if config is missing
    script = Path(__file__).parent.parent / "obsidian-sync" / "markdown_export.py"
    audio = tmp_path / "entry2.webm"
    transcript = tmp_path / "entry2.txt"
    audio.write_bytes(b"FAKEAUDIO")
    transcript.write_text("Transcript.")
    result = subprocess.run([
        "python3", str(script), str(audio), str(transcript), "summary"],
        capture_output=True, text=True
    )
    assert result.returncode != 0
    assert "Vault config not found" in result.stderr

def test_master_index_created_and_updated(tmp_path):
    # Setup vault and export two entries
    audio1 = tmp_path / "a1.webm"
    transcript1 = tmp_path / "a1.txt"
    audio2 = tmp_path / "a2.webm"
    transcript2 = tmp_path / "a2.txt"
    audio1.write_bytes(b"A1")
    transcript1.write_text("Transcript 1")
    audio2.write_bytes(b"A2")
    transcript2.write_text("Transcript 2")
    summary1 = "Summary 1"
    summary2 = "Summary 2"
    vault, attachments, config = setup_vault(tmp_path)
    script = tmp_path / "markdown_export.py"
    orig = Path(__file__).parent.parent / "obsidian-sync" / "markdown_export.py"
    shutil.copy(orig, script)
    # Export first entry
    subprocess.run([
        "python3", str(script), str(audio1), str(transcript1), summary1],
        env={"PYTHONPATH": str(tmp_path), **dict(**os.environ,)},
        capture_output=True, text=True
    )
    # Export second entry
    subprocess.run([
        "python3", str(script), str(audio2), str(transcript2), summary2],
        env={"PYTHONPATH": str(tmp_path), **dict(**os.environ,)},
        capture_output=True, text=True
    )
    index = vault / "Audio Journal Index.md"
    assert index.exists()
    lines = index.read_text().splitlines()
    # Should have title and two links, newest first (after title)
    links = [l for l in lines if l.startswith("[[")]
    assert len(links) == 2
    # Newest entry should be first after title
    assert links[0] != links[1]
    assert lines[0].startswith("# Audio Journal Index")
    # No duplicates
    assert len(set(links)) == 2
