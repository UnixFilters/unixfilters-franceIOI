import os
import tempfile
import commands


def create_temp_file(content):
    tmp = tempfile.NamedTemporaryFile(delete=False, mode="w+", encoding="utf-8")
    tmp.write(content)
    tmp.close()
    return tmp.name


def test_cat_simple():
    filename = create_temp_file("pêche\npomme\npoire\nabricot\nbanane\nfraise\nkiwi\n")
    commands.reset_output()
    commands.cat(filename=filename)
    output = commands.get_output()
    assert (
        output["steps"][0]["output"]
        == "pêche\npomme\npoire\nabricot\nbanane\nfraise\nkiwi\n"
    )
    os.remove(filename)


def test_grep_simple():
    filename = create_temp_file("pêche\npomme\npoire\nabricot\nbanane\nfraise\nkiwi\n")
    commands.reset_output()
    commands.grep(pattern="^p", filename=filename)
    output = commands.get_output()
    assert "pêche\npomme\npoire\n" in output["steps"][0]["output"]
    os.remove(filename)


def test_sort_simple():
    filename = create_temp_file("pêche\npomme\npoire\nabricot\nbanane\nfraise\nkiwi\n")
    commands.reset_output()
    commands.sort(filename=filename)
    output = commands.get_output()
    assert (
        output["steps"][0]["output"]
        == "abricot\nbanane\nfraise\nkiwi\npêche\npoire\npomme\n"
    )
    os.remove(filename)


def test_chaining_commands():
    filename = create_temp_file("pêche\npomme\npoire\nabricot\nbanane\n")
    commands.reset_output()
    commands.cat(filename=filename)
    commands.grep(pattern="^po")
    commands.sort()
    output = commands.get_output()
    result = output["steps"][-1]["output"]
    assert result.startswith("poire") or result.startswith("pomme")
    os.remove(filename)


def test_error_handling():
    commands.reset_output()
    commands.cat(filename="incorect_file_name.txt")
    output = commands.get_output()
    step = output["steps"][0]
    assert step["return"] != 0
    assert step["stderr"]
