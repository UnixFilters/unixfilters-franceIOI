// This is a unixfilters of library for use with quickAlgo.

var getContext = function (display, infos, curLevel) {
  // Local language strings for each language
  var localLanguageStrings = {
    fr: {
      // French strings
      label: {
        // Labels for the blocks
        cat: "cat",
        grep: "grep",
        sort: "sort",
        uniq: "uniq",
        head: "head",
        cut: "cut",
        tail: "tail",
        tee: "tee",
        tr: "tr",
        uniq: "uniq",
        wc: "wc",
        sed: "sed",
        filename: "",
        symbol_greater_than: ">",
        symbol_even_greater_than: ">>",
        symbol_less_than: "<",
      },
      code: {
        // Names of the functions in Python, or Blockly translated in JavaScript
        cat: "cat",
        grep: "grep",
        sort: "sort",
        uniq: "uniq",
        head: "head",
        cut: "cut",
        tail: "tail",
        tee: "tee",
        tr: "tr",
        uniq: "uniq",
      },
      description: {
        // Descriptions of the functions in Python (optional)
        cat: "cat file.txt : affiche le contenu du fichier file.txt",
        grep: "grep 'mot' : affiche les lignes d'entrée contenant le mot 'mot'",
        sort: "sort : affiche les lignes triées du fichier (par défaut ordre alphabétique)",
        uniq: "uniq : affiche les lignes en supprimant les multiples occurrences consécutives d'une même ligne",
        head: "head",
        //   pipe: "pipe : redirige la sortie d'une commande vers une autre commande",
      },
      constant: {},
      startingBlockName: "Ligne de commande", // Name for the starting block
      messages: {
        outputCorrect: "Exécution terminée.",
        noPreviousOutput:
          "This command must get the output from another command.",
        //   previousOutputNotPiped: "This command must follow a pipe.",
        //   previousOutputAlreadyPiped: "Pipe has already been used.",
      },
    },
  };

  // Create a base context
  var context = quickAlgoContext(display, infos);
  // Import our localLanguageStrings into the global scope
  var strings = context.setLocalLanguageStrings(localLanguageStrings);

  // Some data can be made accessible by the library through the context object
  context.unixfilters = {};

  // A context must have a reset function to get back to the initial state
  context.reset = function (taskInfos) {
    UnixFilters.reset(taskInfos);
    context.success = false;

    if (context.display) {
      context.resetDisplay();
    }
  };

  // Reset the context's display
  context.resetDisplay = function () {
    UnixFilters.resetDisplay(context);
    UnixFilters.onChange(context);
    context.blocklyHelper.updateSize();
    context.updateScale();
  };

  context.onChange = function () {
    UnixFilters.onChange(context);
  };

  // Update the context's display to the new scale (after a window resize for instance)
  context.updateScale = function () {
    if (!context.display) {
      return;
    }
  };

  // When the context is unloaded, this function is called to clean up
  // anything the context may have created
  context.unload = function () {
    // Do something here
    if (context.display) {
      // Do something here
    }
  };

  if (context.display) {
    const wsContainer = document.querySelector("#blocklyLibContent");
    if (wsContainer) {
      function handleMouseEnter(event) {
        UnixFilters.removeNoops(context);
      }
      wsContainer.addEventListener("mouseenter", handleMouseEnter);
    }
  }
  /***** Functions *****/
  // For each function in UnixFilters.functions, we define a function
  // that will be called when the block is executed

  for (var funcName in UnixFilters.functions) {
    context.unixfilters[funcName] = (function (funcName) {
      return function () {
        var callback = arguments[arguments.length - 1];
        var otherArgs = Array.prototype.slice.call(arguments, 0, -1);
        UnixFilters.functions[funcName].apply(context, otherArgs);
        context.runner.waitDelay(callback);
      };
    })(funcName);
  }

  /***** Blocks definitions *****/
  /* Here we define all blocks/functions of the library.
      Structure is as follows:
      {
         group: [{
            name: "someName",
            // category: "categoryName",
            // yieldsValue: optional true: Makes a block with return value rather than simple command
            // params: optional array of parameter types. The value 'null' denotes /any/ type. For specific types, see the Blockly documentation ([1,2])
            // handler: optional handler function. Otherwise the function context.group.blockName will be used
            // blocklyJson: optional Blockly JSON objects
            // blocklyInit: optional function for Blockly.Blocks[name].init
            //   if not defined, it will be defined to call 'this.jsonInit(blocklyJson);
            // blocklyXml: optional Blockly xml string
            // codeGenerators: optional object:
            //   { Python: function that generates Python code
            //     JavaScript: function that generates JS code
            //   }
         }]
      }
      [1] https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks
      [2] https://developers.google.com/blockly/guides/create-custom-blocks/type-checks
   */

  const COMMAND_NAMES = [
    "cat",
    "sort",
    "head",
    "cut",
    "tail",
    "tee",
    "tr",
    "uniq",
    "wc",
    "sed",
  ];

  // Array defining available options for flags and field indices
  const OPTIONS = [
    { flag: "v", type: "flag" },
    { flag: "i", type: "flag" },
    { flag: "n", type: ["flag", "field_index"] },
    { flag: "c", type: ["flag", "field_index"] },
    { flag: "r", type: "flag" },
    { flag: "u", type: "flag" },
    { flag: "k", type: "field_index" },
    { flag: "d", type: ["flag", "delimiter"] },
    { flag: "t", type: "delimiter" },
    { flag: "f", type: "field_index" },
    { flag: "a", type: "flag" },
    { flag: "s", type: "flag" },
    { flag: "w", type: "flag" },
    { flag: "l", type: "flag" },
    { flag: "m", type: "flag" },
    { flag: "e", type: "flag" },
  ];

  // Array defining symbol name and colour
  const SYMBOL_NAMES = [
    { name: "symbol_greater_than", colour: 25 },
    { name: "symbol_even_greater_than", colour: 90 },
    { name: "symbol_less_than", colour: 50 },
  ];

  // Array defining noop name and colour
  const NOOP_NAMES = [
    { name: "noop_option_flag", colour: 225 },
    { name: "noop_option_field_index", colour: 200 },
    { name: "noop_command", colour: 285 },
    { name: "noop_text", colour: 165 },
  ];

  function makeGrepBlock() {
    // Function to make a grep block
    var blockJson = {
      name: "grep",
      category: "actions",
      colour: 285,
      args0: [
        {
          type: "field_input",
          name: "PATTERN",
          text: "pattern",
        },
        {
          type: "input_value",
          name: "PARAM_0",
        },
      ],
    };

    var fullBlock = {
      init: function () {
        this.jsonInit(blockJson);
      },
    };

    var generateCode = function (block) {
      var pattern = this.getFieldValue("PATTERN");
      const paramBlock = block.getInputTargetBlock("PARAM_0");
      const [arguments] = extractChainedBlocksForCodeSentToLib(paramBlock);
      arguments.unshift(pattern);
      let string = "";
      string = "grep(" + JSON.stringify(arguments) + ");";
      return string;
    };

    return {
      name: blockJson.name,
      category: blockJson.category,
      blocklyJson: blockJson,
      fullBlock: fullBlock,
      codeGenerators: {
        JavaScript: generateCode,
        Python: generateCode,
      },
    };
  }

  // Generates code for a command using the extracted options and/or filename
  function generateCodeForCommand(commandName, block, lang) {
    // lang is not used because we generate the same code for both Python and JavaScript
    const paramBlock = block.getInputTargetBlock("PARAM_0");
    const [arguments] = extractChainedBlocksForCodeSentToLib(
      paramBlock || null
    );
    return `${commandName}(${JSON.stringify(arguments)});`;
  }

  // Creates blocks for options based on their type (flag or field index)
  function makeOptionBlock(optionObject) {
    if (Array.isArray(optionObject.type)) {
      optionObject.type.forEach((type) => {
        if (type === "field_index") {
          makeFieldIndexBlock(optionObject.flag);
        } else if (type === "flag") {
          makeFlagBlock(optionObject.flag);
        } else if (type == "delimiter") {
          makeDelimiterBlock(optionObject.flag);
        }
      });
    } else {
      if (optionObject.type === "field_index") {
        makeFieldIndexBlock(optionObject.flag);
      } else if (optionObject.type === "flag") {
        makeFlagBlock(optionObject.flag);
      } else if (optionObject.type == "delimiter") {
        makeDelimiterBlock(optionObject.flag);
      }
    }
  }

  // Creates a flag option block for a given flag
  function makeFlagBlock(flag) {
    context.customBlocks.unixfilters.actions.push({
      name: "option_" + flag + "_flag",
      blocklyJson: {
        name: "-" + flag,
        message0: `-${flag} %1`,
        args0: [
          {
            type: "input_value",
            name: "PARAM_0",
          },
        ],
        colour: 225,
        output: "null",
      },
    });
    context.unixfilters["option_" + flag + "_flag"] = function () {
      UnixFilters.currentOptions.push("-" + flag + "_flag");
    };
  }

  // Creates a field index option block for a given flag
  function makeFieldIndexBlock(flag) {
    context.customBlocks.unixfilters.actions.push({
      name: "option_" + flag + "_field_index",
      blocklyJson: {
        name: "-" + flag,
        message0: `-${flag} %1 %2`,
        colour: 200,
        args0: [
          {
            type: "field_input",
            name: "PARAM_1",
            text: "",
          },
          {
            type: "input_value",
            name: "PARAM_0",
            text: "",
          },
        ],
        output: "null",
      },
    });
    context.unixfilters["option_" + flag + "_field_index"] = function () {
      UnixFilters.currentOptions.push("-" + flag + "_field_index");
    };
  }

  // Creates a delimiter option block for a given flag
  function makeDelimiterBlock(flag) {
    context.customBlocks.unixfilters.actions.push({
      name: "option_" + flag + "_delimiter",
      blocklyJson: {
        name: "-" + flag,
        message0: `-${flag} %1 %2`,
        colour: 200,
        args0: [
          {
            type: "field_input",
            name: "PARAM_1",
            text: "",
          },
          {
            type: "input_value",
            name: "PARAM_0",
            text: "",
          },
        ],
        output: "null",
      },
    });
    context.unixfilters["option_" + flag + "_field_index"] = function () {
      UnixFilters.currentOptions.push("-" + flag + "_field_index");
    };
  }

  // Creates a block for a given command name
  function makeUnixFilterBlock(commandName) {
    return {
      name: commandName,
      blocklyJson: {
        colour: 285,
        args0: [
          {
            type: "input_value",
            name: "PARAM_0",
          },
        ],
      },
      codeGenerators: {
        Python: (block) => generateCodeForCommand(commandName, block, "Python"),
        JavaScript: (block) =>
          generateCodeForCommand(commandName, block, "JavaScript"),
      },
    };
  }

  // Creates a block for a given command name
  function makeNoopBlock(noopObject) {
    return {
      name: noopObject.name,
      blocklyJson: {
        colour: noopObject.colour,
        type: "noop",
        message0: "",
        output: "null",
      },
    };
  }

  // Creates a block for symbol
  function makeSymbolBlock(symbolObject) {
    return {
      name: symbolObject.name,
      blocklyJson: {
        colour: symbolObject.colour,
        args0: [
          {
            type: "input_value",
            name: "PARAM_0",
          },
        ],
        output: "null",
      },
    };
  }

  context.customBlocks = {
    // Define our blocks for our namespace "unixfilters"
    unixfilters: {
      // Categories are reflected in the Blockly menu
      actions: [
        // {
        //   name: "filename",
        //   blocklyJson: {
        //     colour: 165,
        //     args0: [
        //       {
        //         type: "field_input",
        //         name: "PARAM_1",
        //         text: "fruits.txt",
        //       },
        //     ],
        //     output: "null",
        //   },
        // },

        {
          name: "text_input",
          blocklyJson: {
            message0: `%1 %2`,
            args0: [
              {
                type: "field_input",
                name: "PARAM_1",
                text: "a-z",
              },
              {
                type: "input_value",
                name: "PARAM_0",
              },
            ],
            output: null,
            colour: 165,
          },
        },

        makeGrepBlock(),
      ],
    },
  };

  // Creates an option block for each option in array
  OPTIONS.forEach((option) => {
    makeOptionBlock(option);
  });

  // Creates a block for each command in array
  COMMAND_NAMES.forEach((command) => {
    context.customBlocks.unixfilters.actions.push(makeUnixFilterBlock(command));
  });

  // Creates a symbol block for each name in array
  SYMBOL_NAMES.forEach((symbol) => {
    context.customBlocks.unixfilters.actions.push(makeSymbolBlock(symbol));
  });

  // Creates a noop block for each name in array
  NOOP_NAMES.forEach((noop) => {
    context.customBlocks.unixfilters.actions.push(makeNoopBlock(noop));
  });

  // Color indexes of block categories (as a hue in the range 0–420)
  context.provideBlocklyColours = function () {
    return {
      categories: {
        actions: 0,
        sensors: 100,
      },
    };
  };

  context.customConstants = {};

  return context;
};

if (window.quickAlgoLibraries) {
  quickAlgoLibraries.register("unixfilters", getContext);
} else {
  if (!window.quickAlgoLibrariesList) {
    window.quickAlgoLibrariesList = [];
  }
  window.quickAlgoLibrariesList.push(["unixfilters", getContext]);
}
