// This is a unixfilters of library for use with quickAlgo.

var getContext = function (display, infos, curLevel) {
  // Local language strings for each language
  var localLanguageStrings = {
    fr: {
      categories: {
        cat: "cat",
        sort: "sort",
        head: "head",
        cut: "cut",
        tail: "tail",
        tee: "tee",
        tr: "tr",
        uniq: "uniq",
        wc: "wc",
        sed: "sed",
        grep: "grep",
        symbols: "Redirections",
        inputs: "Entrée",
      },
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

  // When the mouse enters the workspace or toolbox, remove all no-op blocks that were generated
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

  const COMMANDS = [
    {
      commandName: "cat",
      tooltip: "Concatène et affiche le contenu d'un fichier",
      format: "cat [options] fichier",
    },
    {
      commandName: "sort",
      tooltip: "Trie les lignes d'un fichier",
      format: "sort [options] fichier",
    },
    {
      commandName: "head",
      tooltip: "Affiche les premières lignes d'un fichier",
      format: "head [options] fichier",
    },
    {
      commandName: "cut",
      tooltip: "Extrait des colonnes spécifiques",
      format: "cut [options] fichier",
    },
    {
      commandName: "tail",
      tooltip: "Affiche les dernières lignes d'un fichier",
      format: "tail [options] fichier",
    },
    {
      commandName: "tee",
      tooltip: "Duplique la sortie vers un fichier et la console",
      format: "tee [options] fichier",
    },
    {
      commandName: "tr",
      tooltip: "Remplace ou supprime des caractères",
      format: "tr [options]",
    },
    {
      commandName: "uniq",
      tooltip: "Supprime les lignes dupliquées adjacentes",
      format: "uniq [options] fichier",
    },
    {
      commandName: "wc",
      tooltip: "Compte lignes, mots et caractères",
      format: "wc [options] fichier",
    },
    {
      commandName: "sed",
      tooltip: "Editeur de flux pour transformer du texte",
      format: "sed [options] script fichier",
    },
  ];

  // Array defining symbol name and colour
  const SYMBOL_NAMES = [
    {
      name: "symbol_greater_than",
      colour: 25,
      tooltip:
        "redirige le flux de sortie de la commande pour la placer dans un fichier",
    },
    {
      name: "symbol_even_greater_than",
      colour: 90,
      tooltip:
        "redirige le flux de sortie de la commande pour l’ajouter à la fin d’un fichier existant",
    },
    {
      name: "symbol_less_than",
      colour: 50,
      tooltip:
        "redirige le flux d'entrée de la commande pour la prendre dans un fichier",
    },
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
      colour: 285,
      tooltip:
        "Permet de rechercher un motif dans un fichier.\n Usage : grep pattern [options] fichier ",
      args0: [
        {
          type: "field_input",
          name: "PARAM_1",
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
      var pattern = this.getFieldValue("PARAM_1");
      sanitizedPattern = removeEventualQuotes(pattern);
      const paramBlock = block.getInputTargetBlock("PARAM_0");
      const [args] = extractChainedBlocksForCodeSentToLib(paramBlock);
      args.unshift(sanitizedPattern);
      return "grep(" + JSON.stringify(args) + ")\n";
    };

    const block = {
      name: blockJson.name,
      category: blockJson.category,
      blocklyJson: blockJson,
      fullBlock: fullBlock,
      codeGenerators: {
        JavaScript: generateCode,
        Python: generateCode,
      },
    };
    if (!context.customBlocks.unixfilters["grep"]) {
      context.customBlocks.unixfilters["grep"] = [];
    }

    context.customBlocks.unixfilters["grep"].push(block);
  }

  // Generates code for a command using the extracted options and/or filename
  function generateCodeForCommand(commandName, block, lang) {
    // lang is not used because we generate the same code for both Python and JavaScript
    const paramBlock = block.getInputTargetBlock("PARAM_0");
    const [args] = extractChainedBlocksForCodeSentToLib(paramBlock || null);
    return `${commandName}(${JSON.stringify(args)})\n`;
  }

  // Creates an option block based on its type (flag or field_index)
  function makeOptionBlock(flag, type = "flag") {
    const blockName = `option_${flag}_${type}`;

    // Get the list of commands compatible with this flag and type
    const compatibleCommands = Object.entries(optionTooltips)
      .filter(([_, flags]) => flags[flag] && flags[flag][type])
      .map(([command]) => command);

    // Basic option block structure
    let blocklyJson = {
      name: `-${flag}`,
      output: "null",
    };

    // COnfigure block layout based on the option type
    switch (type) {
      case "flag":
        blocklyJson = {
          ...blocklyJson,
          message0: `-${flag} %1`,
          args0: [
            {
              type: "input_value",
              name: "PARAM_0",
            },
          ],
          colour: 225,
        };
        break;

      case "field_index":
        blocklyJson = {
          ...blocklyJson,
          message0: `-${flag} %1 %2`,
          args0: [
            {
              type: "field_input",
              name: "PARAM_1",
              text: "",
            },
            {
              type: "input_value",
              name: "PARAM_0",
            },
          ],
          colour: 200,
        };
        break;

      default:
        throw new Error(`Type d'option inconnu : ${type}`);
    }

    const fullBlock = {
      init: function () {
        this.jsonInit(blocklyJson);
        const tooltip = getDynamicTooltipForToolbox(this.type);
        this.setTooltip(tooltip);
      },
    };

    for (cde of compatibleCommands) {
      context.customBlocks.unixfilters[cde].push({
        name: blockName + "_" + cde,
        blocklyJson,
        fullBlock,
      });
    }
    context.unixfilters[blockName] = function () {
      UnixFilters.currentOptions.push(blockName);
    };
  }

  // Creates a block for a Unix command (grep, sort,...)
  function makeCommandBlock(commandArray) {
    commandArray.forEach((command) => {
      const block = {
        name: command.commandName,
        blocklyJson: {
          tooltip: command.tooltip + "\n Usage : " + command.format,
          colour: 285,
          args0: [
            {
              type: "input_value",
              name: "PARAM_0",
            },
          ],
        },
        codeGenerators: {
          Python: (block) =>
            generateCodeForCommand(command.commandName, block, "Python"),
          JavaScript: (block) =>
            generateCodeForCommand(command.commandName, block, "JavaScript"),
        },
      };

      if (!context.customBlocks.unixfilters[command.commandName]) {
        context.customBlocks.unixfilters[command.commandName] = [];
      }

      context.customBlocks.unixfilters[command.commandName].push(block);
    });
  }

  // Creates a "noop" (no-operation) block (placeholder block with no behavior)
  function makeNoopBlock(noopArray) {
    noopArray.forEach((noop) => {
      context.customBlocks.unixfilters.commands.push({
        name: noop.name,
        blocklyJson: {
          colour: noop.colour,
          type: "noop",
          message0: "",
          output: "null",
        },
      });
    });
  }

  // Creates a symbol block (>,>>,<)
  function makeSymbolBlock(symbolArray) {
    symbolArray.forEach((symbol) => {
      context.customBlocks.unixfilters.symbols.push({
        name: symbol.name,
        blocklyJson: {
          tooltip: symbol.tooltip,
          colour: symbol.colour,
          args0: [
            {
              type: "input_value",
              name: "PARAM_0",
            },
          ],
          output: "null",
        },
      });
    });
  }

  context.customBlocks = {
    // Define our blocks for our namespace "unixfilters"
    unixfilters: {
      // Categories are reflected in the Blockly menu
      inputs: [
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
      ],
      commands: [],
      symbols: [],
    },
  };
  makeCommandBlock(COMMANDS);
  makeGrepBlock();

  Object.entries(optionTooltips).forEach(([command, options]) => {
    Object.entries(options).forEach(([key, data]) => {
      const labelType = data.flag ? "flag" : "field_index";
      makeOptionBlock(key, labelType);
    });
  });

  makeSymbolBlock(SYMBOL_NAMES);
  makeNoopBlock(NOOP_NAMES);

  // Color indexes of block categories (as a hue in the range 0–420)
  context.provideBlocklyColours = function () {
    return {
      categories: {
        symbols: 50,
        noop: 225,
        inputs: 165,
        cat: 285,
        sort: 285,
        head: 285,
        cut: 285,
        tail: 285,
        tee: 285,
        tr: 285,
        uniq: 285,
        wc: 285,
        sed: 285,
        grep: 285,
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
