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
    print("python code: ", python_code)
    python_code_split = python_code.split(";")

    # temporary directory
    temp_dir = tempfile.mkdtemp()
    try:
        # files creation
        fruits_content = "pêche\npomme\npoire\nabricot\nbanane\nfraise\nkiwi\npomme\n"
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

        ages_content = (
            "alice:72\nbob:48\nclaire:34\n"
            "daniel:31\neve:67\nfrank:57\n"
            "george:49\nhannah:55\nirene:43\njack:78\n"
        )
        with open(os.path.join(temp_dir, "ages.txt"), "w", encoding="utf-8") as f:
            f.write(ages_content)
            shutil.copy("commands.py", os.path.join(temp_dir, "commands.py"))

        books_content = "Le Petit Prince - Antoine de Saint-Exupéry\n1984 - George Orwell\nHarry Potter - J.K. Rowling\nLe Seigneur des Anneaux - J.R.R. Tolkien\nDune - Frank Herbert\nFondation - Isaac Asimov"
        with open(os.path.join(temp_dir, "livres.txt"), "w", encoding="utf-8") as f:
            f.write(books_content)
            shutil.copy("commands.py", os.path.join(temp_dir, "commands.py"))

        journal_content = (
            "Aujourd'hui il fait beau. J'ai rencontré mes amis au parc. Nous avons joué au football. "
            "C'était une excellente journée !"
        )
        with open(os.path.join(temp_dir, "journal.txt"), "w", encoding="utf-8") as f:
            f.write(journal_content)
            shutil.copy("commands.py", os.path.join(temp_dir, "commands.py"))

        archives_content = "15/08/2020\n22/05/2019\n10/01/2021\n01/11/2022"
        with open(os.path.join(temp_dir, "archives.txt"), "w", encoding="utf-8") as f:
            f.write(archives_content)
            shutil.copy("commands.py", os.path.join(temp_dir, "commands.py"))

        presentations_content = "Erreur critique dans le systèME. C'est une ERREUR qu'on doit corriger. Erreur et rectification nécessaires."
        with open(
            os.path.join(temp_dir, "presentation.txt"), "w", encoding="utf-8"
        ) as f:
            f.write(presentations_content)
            shutil.copy("commands.py", os.path.join(temp_dir, "commands.py"))

        transactions_content = (
            "ID,Client,Montant,Date\n1,John,250,2025-06-01\n2,Alice,1500,2025-06-02\n3,Bob,750,2025-06-03\n"
            + "4,Charlie,3000,2025-06-04\n5,David,1200,2025-06-05\n6,Eve,500,2025-06-06\n7,Frank,1700,2025-06-07\n"
        )
        with open(
            os.path.join(temp_dir, "transactions.txt"), "w", encoding="utf-8"
        ) as f:
            f.write(transactions_content)
            shutil.copy("commands.py", os.path.join(temp_dir, "commands.py"))

        # Using Python lib to get the output and dumping the JSON object
        script_path = os.path.join(temp_dir, "run_script.py")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write("import commands\n")
            f.write("commands.reset_output()\n\n")
            for command in python_code_split:
                command = command.strip()
                if command:
                    f.write(f"commands." + command + "\n")

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
