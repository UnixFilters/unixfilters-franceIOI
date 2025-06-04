import subprocess
import os


_current_output = ""


def reset_output():
    global _current_output
    _current_output = ""


def get_output():
    return _current_output


def cat(options, filename):
    global _current_output
    cmd = ["cat"] + options + [filename]
    try:
        result = subprocess.run(
            cmd, input=_current_output, capture_output=True, text=True, check=True
        )
        _current_output = result.stdout
    except subprocess.CalledProcessError as error:
        _current_output = error.stderr or ""


def grep(options, pattern, filename):
    global _current_output
    cmd = ["grep"] + options + [pattern] + [filename]
    try:
        result = subprocess.run(
            cmd, input=_current_output, capture_output=True, text=True, check=True
        )
        _current_output = result.stdout
    except subprocess.CalledProcessError as error:
        _current_output = error.stderr or ""
