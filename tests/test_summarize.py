import tempfile
from pathlib import Path
import subprocess

def test_summarize_short_text():
    """
    Test summarization script with a short transcript.
    """
    text = "Today I went for a walk and felt happy."
    with tempfile.NamedTemporaryFile('w+', delete=False) as tf:
        tf.write(text)
        tf.flush()
        result = subprocess.run([
            'python3', 'local-ai/summarize.py', tf.name
        ], capture_output=True, text=True)
        assert result.returncode == 0
        assert "Summary:" in result.stdout
        assert "walk" in result.stdout or "happy" in result.stdout


def test_summarize_file_not_found():
    """
    Edge case: transcript file does not exist.
    """
    result = subprocess.run([
        'python3', 'local-ai/summarize.py', 'nonexistent.txt'
    ], capture_output=True, text=True)
    assert result.returncode != 0
    assert "File not found" in result.stderr


def test_summarize_long_text():
    """
    Test summarization with a longer transcript (should not error, returns summary).
    """
    text = "This is a long transcript. " * 100
    with tempfile.NamedTemporaryFile('w+', delete=False) as tf:
        tf.write(text)
        tf.flush()
        result = subprocess.run([
            'python3', 'local-ai/summarize.py', tf.name
        ], capture_output=True, text=True)
        assert result.returncode == 0
        assert "Summary:" in result.stdout
        assert len(result.stdout) < 200  # Summary should be shorter than original
