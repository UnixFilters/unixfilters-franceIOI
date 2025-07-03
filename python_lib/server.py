from flask import Flask, request, jsonify
from flask_cors import CORS
import os, subprocess, json

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

PATH_BASE = "../../../../../../UnixFilters/Exemple/tests"
PATH_GEN = os.path.join(PATH_BASE, "gen")
PATH_FILES = os.path.join(PATH_BASE, "files")


@app.route("/api/commands", methods=["POST"])
def save_solution():
    try:
        data = request.json
        python_code = data.get("commands", "")
        path_solution = os.path.join(PATH_GEN, "solution.py")
        with open(path_solution, "w", encoding="utf-8") as f:
            f.write(python_code)

        path_commands = os.path.join(PATH_GEN, "commands.py")
        print("path commands", path_commands)
        path_input = os.path.join(PATH_FILES, "test01.in")
        path_solout = os.path.join(PATH_FILES, "test01.solout")

        # python3 commands.py < ../files/test01.in > ../files/test01.solout
        with open(path_input, "r") as fin, open(path_solout, "w") as fout:
            subprocess.run(
                ["python3", "commands.py"],
                stdin=fin,
                stdout=fout,
                check=True,
                cwd=PATH_GEN,
            )

        path_checker = os.path.join(PATH_GEN, "checker.py")
        path_output = os.path.join(PATH_FILES, "test01.out")
        # python3 checker.py ../files/test01.solout ../files/test01.in ../files/test01.out
        result = subprocess.run(
            ["python3", path_checker, path_solout, path_input, path_output],
            capture_output=True,
            text=True,
            check=True,
        )

        output_lines = result.stdout.strip().splitlines()

        score = output_lines[0]
        message = output_lines[1]
        json_str = "\n".join(output_lines[2:])
        steps = json.loads(json_str)
        print("STEPS", steps)
        return jsonify({"score": score, "feedback": message, "steps": steps})
    except subprocess.CalledProcessError as error:
        return (
            jsonify(
                {
                    "error": "Error encountered",
                    "stdout": error.stdout,
                    "stderr": error.stderr,
                }
            ),
            500,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5004)
