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
_command_chain = []


def reset_output():
    global _current_output, _steps, _command_chain
    _current_output = ""
    _steps = []
    _command_chain = []


def get_output():
    return {"steps": [s.to_dict() for s in _steps]}


def run_command(command_name, options=None, args=None):
    global _current_output, _command_chain
    if options is None:
        options = []
    if args is None:
        args = []

    cmd = [command_name] + options + args
    cmd_str = " ".join(cmd)
    _command_chain.append(cmd_str)
    full_cmd_str = " | ".join(_command_chain)

    try:
        result = subprocess.run(
            cmd, input=_current_output, capture_output=True, text=True, check=True
        )
        step = CommandStep(
            len(_steps), full_cmd_str, result.stdout, result.stderr, result.returncode
        )
        _current_output = result.stdout
    except subprocess.CalledProcessError as error:
        step = CommandStep(
            len(_steps), full_cmd_str, "", error.stderr, error.returncode
        )
        _current_output = error.stderr or ""
    _steps.append(step)


def cat(options=None, filename=None):
    run_command("cat", options=options, args=[filename] if filename else [])


def grep(options=None, pattern=None, filename=None):
    args = []
    if pattern:
        args.append(pattern)
    if filename:
        args.append(filename)
    run_command("grep", options=options, args=args)


def sort(options=None, filename=None):
    run_command("sort", options=options, args=[filename] if filename else [])


def head(options=None, filename=None):
    run_command("head", options=options, args=[filename] if filename else [])


def cut(options=None, filename=None):
    run_command("cut", options=options, args=[filename] if filename else [])
