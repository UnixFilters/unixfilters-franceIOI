import sys, subprocess, traceback, json


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


def run_command(command_name, arguments=None):
    global _current_output, _command_chain
    if arguments is None:
        print("no arguments")
        arguments = []
    redirection_in = None
    redirection_out = None
    redirection_out_append = False

    cmd_temp = [command_name] + arguments
    cmd_str = " ".join(cmd_temp)
    _command_chain.append(cmd_str)
    full_cmd_str = " | ".join(_command_chain)

    while ">>" in arguments:
        idx = arguments.index(">>")
        redirection_out = True
        redirection_out_append = True
        filename_redirection_out = arguments.pop(idx + 1)
        arguments.pop(idx)

    while ">" in arguments:
        idx = arguments.index(">")
        redirection_out = True
        filename_redirection_out = arguments.pop(idx + 1)
        arguments.pop(idx)

    while "<" in arguments:
        idx = arguments.index("<")
        redirection_in = True
        filename_redirection_in = arguments.pop(idx + 1)
        arguments.pop(idx)

    cmd = [command_name] + arguments

    try:

        if redirection_in:
            with open(filename_redirection_in, "r") as infile:
                result = subprocess.run(
                    cmd, input=infile.read(), capture_output=True, text=True, check=True
                )
        elif redirection_out:
            mode = "a" if redirection_out_append else "w"
            with open(filename_redirection_out, mode) as outfile:
                result = subprocess.run(
                    cmd,
                    input=_current_output,
                    text=True,
                    check=True,
                    stdout=outfile,
                )
        else:
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


def cat(arguments=None):
    run_command("cat", arguments=arguments)


def grep(arguments=None, pattern=None):
    if pattern:
        arguments.append(pattern)
    run_command("grep", arguments=arguments)


def sort(arguments=None):
    run_command("sort", arguments=arguments)


def head(arguments=None):
    run_command("head", arguments=arguments)


def cut(arguments=None):
    run_command("cut", arguments=arguments)


def tail(arguments=None):
    run_command("tail", arguments=arguments)


def tee(arguments=None):
    run_command("tee", arguments=arguments)


def tr(arguments=None):
    run_command("tr", arguments=arguments)


def uniq(arguments=None):
    run_command("uniq", arguments=arguments)


def wc(arguments=None):
    run_command("wc", arguments=arguments)


def sed(arguments=None):
    run_command("sed", arguments=arguments)


# # Executer le programme
# try:
#     with open("solution.py") as f:
#         code = compile(f.read(), "solution.py", "exec")
#         exec(code)
# except:
#     # Enlever le runner du traceback en cas d'erreur
#     excInfo = sys.exc_info()
#     traceback.print_exception(excInfo[0], excInfo[1], excInfo[2].tb_next)
#     sys.exit(1)

# # Afficher les steps
# print(json.dumps(get_output(), indent=4))
