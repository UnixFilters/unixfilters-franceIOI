from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import os
import shutil
import subprocess
import json
import commands

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])


@app.route("/api/commands", methods=["POST"])
def run_code():
    data = request.get_json()
    if not data or "commands" not in data:
        return jsonify({"error": "code missing"}), 400

    python_code = data["commands"]
    print("python code", python_code)
    python_code_split = python_code.split(";")
    print("python code split", python_code_split)

    # temporary directory
    temp_dir = tempfile.mkdtemp()
    try:
        # files creation
        fruits_content = "pêche\npomme\npoire\nabricot\nbanane\nfraise\nkiwi\n"
        with open(os.path.join(temp_dir, "fruits.txt"), "w", encoding="utf-8") as f:
            f.write(fruits_content)
        wages_content = (
            "alice 7200\nbob 4800\nclaire 9100\n"
            "daniel 3150\neve 6700\nfrank 10000\n"
            "george 9999\nhannah 5500\nirene 4300\njack 7800\n"
        )
        with open(os.path.join(temp_dir, "wages.txt"), "w", encoding="utf-8") as f:
            f.write(wages_content)
            shutil.copy("commands.py", os.path.join(temp_dir, "commands.py"))

        # Using Python lib to get the output and dumping the JSON object
        script_path = os.path.join(temp_dir, "run_script.py")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write("import commands\n")
            f.write("commands.reset_output()\n\n")
            for command in python_code_split:
                command = command.strip()
                if command:
                    f.write(f"commands.{command};\n\n")

            f.write(
                "import json\n"
                "result=commands.get_output()\n"
                "print(json.dumps(result))\n"
            )

        process = subprocess.run(
            ["python3", script_path], cwd=temp_dir, capture_output=True, text=True
        )
        if process.returncode != 0:
            print("STDERR:", process.stderr)
            return (
                jsonify(
                    {
                        "error": "Error executing script",
                        "stderr": process.stderr,
                        "code": process.returncode,
                    }
                ),
                500,
            )
        try:
            result_json = json.loads(process.stdout)
        except json.JSONDecodeError:
            return (
                jsonify(
                    {
                        "error": "JSON returned by the script is invalid",
                        "stdout": process.stdout,
                        "code": process.returncode,
                    }
                ),
                500,
            )
        return jsonify(result_json), 200
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=True)
