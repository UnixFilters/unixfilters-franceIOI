var UnixFilters = {
    functions: {},
    currentOutput: null,
    pipedOutput: false
};

// Define the files
UnixFilters.files = {
    "fruits.txt": `pêche
pomme
poire
abricot
banane
fraise
kiwi
`
};


UnixFilters.reset = function(taskInfos) {
    UnixFilters.currentOutput = null;
    UnixFilters.pipedOutput = false;
}

// Define the display
UnixFilters.resetDisplay = function(context) {
    $('#grid').html("<h3>Code généré</h3><pre id='generatedCode'></pre><h3>Sortie courante</h3><pre id='output'></pre>");
}

UnixFilters.onChange = function(context) {
    var programBlock = context.blocklyHelper.workspace.getTopBlocks(true).find(function(block) {
        return block.type === 'robot_start';
    });

    const generatedCode = jsonGenerator.blockToCode(programBlock, false)
    $('#generatedCode').text(Array.isArray(generatedCode) ? generatedCode[0] : generatedCode);
}

function showFileContent(filename) {
    var fileContent = UnixFilters.files[filename];
    if(typeof fileContent != 'undefined') {
        return fileContent;
    } else {
        // Maybe display an error?
        return "";
    }
}

function checkPreviousOutput(needOutput) {
    if(UnixFilters.currentOutput === null && needOutput) {
        throw(languageStrings.messages.noPreviousOutput);
    }
    if(UnixFilters.currentOutput !== null && !UnixFilters.pipedOutput) {
        throw(languageStrings.messages.previousOutputNotPiped);
    }
}

function updateOutputDisplay() {
    if(UnixFilters.currentOutput === null) {
        $('#output').text("");
    } else {
        $('#output').text(UnixFilters.currentOutput.join('\n'));
    }
}


UnixFilters.functions.cat = function(filename) {
    checkPreviousOutput();
    UnixFilters.currentOutput = showFileContent(filename).split('\n');
    updateOutputDisplay();
};

UnixFilters.functions.grep = function(flags, pattern, filename) {
    // Filename is undefined if using the version without filename

    checkPreviousOutput(typeof filename == 'undefined');

    const regexFlags = flags.includes('-i') ? 'i' : ''
    const regex = new RegExp(pattern, regexFlags)

    if(filename) {
        const fileContent = showFileContent(filename);
        if (fileContent === null) {
            // Maybe display an error?
            fileContent = "";
        }
        lines = fileContent.split('\n');
    } else {
        lines = UnixFilters.currentOutput;
    }

    let result = lines || []
    if (flags.includes('-v')) {
      result = result.filter((line) => !regex.test(line))
    } else {
      result = result.filter((line) => regex.test(line))
    }
    console.log('result grep ', result)
    UnixFilters.currentOutput = result;
    updateOutputDisplay();
};

UnixFilters.functions.grep_filename = UnixFilters.functions.grep;

UnixFilters.functions.pipe = function(callback) {
    if(UnixFilters.currentOutput === null) {
        throw(languageStrings.messages.noPreviousOutput);
    }
    if(UnixFilters.pipedOutput) {
        throw(languageStrings.messages.previousOutputAlreadyPiped);
    }
    UnixFilters.pipedOutput = true;
};
