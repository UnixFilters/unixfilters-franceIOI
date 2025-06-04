import subprocess


class CommandStep:
    def __init__(self, number, command_string, output, stderr, return_code):
        self.number = number
        self.command_string = command_string
        self.output = output
        self.stderr = stderr
        self.return_code = return_code

    def to_dict(self):
        return {
            "number": self.number,
            "command_string": self.command_string,
            "output": self.output,
            "stderr": self.stderr,
            "return": self.return_code,
        }


_steps = []
_current_output = ""


def reset_output():
    global _current_output
    _current_output = ""


def get_output():
    return {"steps": [s.to_dict() for s in _steps]}


def cat(options, filename):
    global _current_output
    cmd = ["cat"] + options + [filename]
    cmd_str = " ".join(cmd)
    try:
        result = subprocess.run(
            cmd, input=_current_output, capture_output=True, text=True, check=True
        )
        step = CommandStep(
            len(_steps), cmd_str, result.stdout, result.stderr, result.returncode
        )

        _current_output = result.stdout
    except subprocess.CalledProcessError as error:
        step = CommandStep(len(_steps), cmd_str, "", error.stderr, error.returncode)
        _current_output = error.stderr or ""
    _steps.append(step)


def grep(options, pattern, filename):
    global _current_output
    cmd = ["grep"] + options + [pattern] + [filename]
    cmd_str = " ".join(cmd)
    try:
        result = subprocess.run(
            cmd, input=_current_output, capture_output=True, text=True, check=True
        )

        step = CommandStep(1, cmd_str, result.stdout, result.stderr, result.returncode)
        _current_output = step
    except subprocess.CalledProcessError as error:
        step = CommandStep(len(_steps), cmd_str, "", error.stderr, error.returncode)
        _current_output = error.stderr or ""
    _steps.append(step)
