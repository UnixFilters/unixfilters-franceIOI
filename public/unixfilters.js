/**
 * @file blocklyUnixFilters_lib.js
 * @description Functions related to Blockly blocks for Unix filters.
 * @module unixfilters
 */

var UnixFilters = {
  functions: {},
  currentOutput: null,
  pipedOutput: false,
};

/**
 * Resets the internal output state of UnixFilters.
 *
 * @function reset
 * @memberof module:unixfilters
 * @param {Object} taskInfos - Information about the task context (currently unused)
 */
UnixFilters.reset = function (taskInfos) {
  UnixFilters.currentOutput = null;
  UnixFilters.pipedOutput = false;
};

/**
 * Defines the display by creating the buttons and display areas for:
 * Executing commands, navigating through steps and displaying generated code, the current step, and output.
 *
 * @example
 * let a = Something.fn()
 * console.log(a) // Return value of something
 * @function resetDisplay
 * @memberof module:unixfilters
 * @param {Object} context - The execution context, used when executing the command
 */
UnixFilters.resetDisplay = function (context) {
  const groupByCategory = context.blocklyHelper.includeBlocks.groupByCategory;
  window.unixfilters_groupByCategory = groupByCategory;

  $("#grid").html(
    "<pre id='score'></pre>" +
      "<pre id='message'></pre>" +
      "<button id='backToBeginning'>Reset</button>" +
      "<button id='executeCommand'>Exécuter</button>" +
      "<button id='step-by-step'>Step by step</button>" +
      "<button id='goToEnd'>End</button>" +
      "<h3> Code généré</h3>" +
      "<pre id='generatedCode'></pre>" +
      "<h3>Étape en cours</h3>" +
      "<pre id='jsonStep'></pre>" +
      "<h3>Sortie courante</h3>" +
      "<pre id='output'></pre>" +
      "<pre id='commandInput'></pre>"
  );

  // Add event listeners to buttons and link them to their functions
  $("#backToBeginning").on("click", UnixFilters.backToBeginning);
  $("#play").on("click", UnixFilters.play);
  $("#step-by-step").on("click", UnixFilters.nextStep);
  $("#goToEnd").on("click", UnixFilters.end);
  $("#executeCommand").on("click", function () {
    UnixFilters.fillEmptyOptionInputs(context);
    UnixFilters.sendCommandToServer();
  });
};

function findCommandParent(block) {
  let current = block.getParent();
  while (current && !optionTooltips[current.type]) {
    current = current.getParent();
  }
  return current;
}

// Refreshes the tooltip of an option block based on its parent command block
function refreshOptionTooltip(optionBlock) {
  const parent = findCommandParent(optionBlock);
  const blockType = optionBlock.type;
  const parts = blockType.split("_");
  const flagType = parts[2] === "flag" ? "flag" : "field_index";

  if (parts.length < 3) return "";
  const flag = parts[1];
  if (
    parent &&
    optionTooltips[parent.type] &&
    optionTooltips[parent.type][flag] &&
    optionTooltips[parent.type][flag][flagType]
  ) {
    optionBlock.setTooltip(optionTooltips[parent.type][flag][flagType]);
  } else if (
    parent &&
    (!optionTooltips[parent.type] ||
      !optionTooltips[parent.type][flag] ||
      !optionTooltips[parent.type][flag][flagType])
  ) {
    optionBlock.setTooltip(
      "L'option -" + flag + " n'est pas compatible avec cette commande"
    );
  } else {
    optionBlock.setTooltip("Option -" + flag);
  }
}

// Refreshes the tooltip of an option block based on its parent command block
function getDynamicTooltipForToolbox(blockType) {
  // Check if blocks are sorted into categories
  const groupByCategory = window.unixfilters_groupByCategory ?? false;
  // Get the type (flag/field_index) and the command name
  const parts = blockType.split("_");
  if (parts.length < 3) return "";
  const flag = parts[1];
  const type = parts[2] === "flag" ? "flag" : "field_index";
  const commandName = parts[parts.length - 1];

  // If the toolbox is organised in categories, only show the tooltip specific to the option + command name
  if (groupByCategory) {
    for (const [command, options] of Object.entries(optionTooltips)) {
      if (command == commandName && options[flag] && options[flag][type]) {
        return options[flag][type];
      }
    }
    return `Option -${flag}`;
  } else {
    return `Option -${flag}`;
  }
}

// Every time there is a change in the interface
UnixFilters.onChange = function (context) {
  // Generates code from blocks for blocks attached to the block "Ligne de commande"
  var programBlock = context.blocklyHelper.workspace
    .getTopBlocks(true)
    .find(function (block) {
      return block.type === "robot_start";
    });
  const generatedCode = jsonGenerator.blockToCode(programBlock, false);
  $("#generatedCode").text(
    Array.isArray(generatedCode) ? generatedCode[0] : generatedCode
  );
  // Log the generated code in the console (debugging)
  console.log(
    "python code generated",
    task.displayedSubTask.blocklyHelper.getCode("python", null, true)
  );
  if (!context._tooltipListenerRegistered) {
    context.blocklyHelper.workspace.addChangeListener(function (event) {
      if (
        event.type === "move" ||
        event.type === "change" ||
        event.type === "create"
      ) {
        const block = context.blocklyHelper.workspace.getBlockById(
          event.blockId || event.newValue
        );

        if (block) {
          const refreshRecursively = (blk) => {
            if (blk.type.startsWith("option_")) {
              refreshOptionTooltip(blk);
            }
            blk.getChildren().forEach((child) => refreshRecursively(child));
          };
          refreshRecursively(block);
        }
      }
    });
    context._tooltipListenerRegistered = true;
  }
};

function getDetailedTooltip(blockType) {
  const parts = blockType.split("_");
  if (parts.length < 3) return "";
  const flag = parts[1];
  const type = parts[2] === "flag" ? "flag" : "field_index";

  const usages = ["Utilisable avec :"];
  for (const [command, options] of Object.entries(optionTooltips)) {
    if (options[flag] && options[flag][type]) {
      usages.push(`${options[flag][type]}`);
    }
  }

  return usages.length > 1 ? usages.join("\n") : `Option -${flag}`;
}

/**
 * Fills empty input fields (PARAM_0) with no-op blocks if they are not connected.
 *
 * @function fillEmptyOptionInputs
 * @memberof module:unixfilters
 * @param {Object} context - The Blockly execution context
 */
UnixFilters.fillEmptyOptionInputs = function (context) {
  const allBlocks = context.blocklyHelper.workspace.getAllBlocks(false);
  for (const block of allBlocks) {
    const input = block.getInput("PARAM_0");
    if (!input) continue;

    if (!input.connection.isConnected()) {
      let expectedType = null;
      expectedType = getNoopTypeFromBlockType(block.type);

      const dummyBlock = context.blocklyHelper.workspace.newBlock(expectedType);
      dummyBlock.initSvg();
      dummyBlock.render();
      input.connection.connect(dummyBlock.outputConnection);
    }
  }
};

/**
 * Removes all no-op blocks from the workspace.
 *
 * @function removeNoops
 * @memberof module:unixfilters
 * @param {Object} context - The Blockly execution context
 */
UnixFilters.removeNoops = function (context) {
  context.blocklyHelper.workspace.getAllBlocks().forEach(function (block) {
    if (block.type.startsWith("noop")) {
      block.dispose();
    }
  });
};

/**
 * Sends generated Python code to the backend server for execution.
 *
 * @async
 * @function sendCommandToServer
 * @memberof module:unixfilters
 */
UnixFilters.sendCommandToServer = async function () {
  try {
    let pythonCode = task.displayedSubTask.blocklyHelper
      .getCode("python", null, true)
      .trim();
    console.log("sending:", pythonCode);
    const response = await fetch("http://127.0.0.1:5004/api/commands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ commands: pythonCode }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      document.getElementById("output").style.color = "red";
      $("#output").text("Server error");
      throw new Error(
        `Error sending the request to the server: ${errorData.error}`
      );
    }

    const jsonData = await response.json();

    console.log("JSON DATA: ", jsonData);

    updateScore(jsonData.score);
    $("#message").text(jsonData.message);

    UnixFilters.parseJson(jsonData.steps);
    UnixFilters.showStep(UnixFilters.lastIndex);
  } catch (error) {
    console.error("Error when sending command:", error);
  }
};

function updateScore(score) {
  if (score === 100) {
    document.getElementById("score").style.color = "green";
  } else if (score === 90) {
    document.getElementById("score").style.color = "orange";
  } else {
    document.getElementById("score").style.color = "red";
  }
  $("#score").text("Score : " + score);
}

/**
 * Parses JSON data from the server into internal step functions.
 *
 * @function parseJson
 * @memberof module:unixfilters
 * @param {Object} jsonData - The response from the server containing command steps
 */
UnixFilters.parseJson = function (jsonData) {
  UnixFilters.stepData = Object.values(jsonData.steps);
  UnixFilters.currentIndex = 0;
  UnixFilters.lastIndex = Object.values(jsonData.steps).length - 1;
};

/**
 * Moves to the next step in the parsed JSON steps.
 *
 * @function nextStep
 * @memberof module:unixfilters
 */
UnixFilters.nextStep = function () {
  if (
    !UnixFilters.stepData ||
    UnixFilters.currentIndex > UnixFilters.lastIndex
  ) {
    return;
  }
  UnixFilters.currentIndex++;
  UnixFilters.showStep(UnixFilters.currentIndex);
};

/**
 * Skips to the final step in the parsed JSON steps.
 *
 * @function end
 * @memberof module:unixfilters
 */
UnixFilters.end = function () {
  UnixFilters.showStep(UnixFilters.lastIndex);
  UnixFilters.currentIndex = UnixFilters.lastIndex;
};

/**
 * Resets to the beginning of the parsed JSON steps.
 *
 * @function backToBeginning
 * @memberof module:unixfilters
 */
UnixFilters.backToBeginning = function () {
  UnixFilters.showStep(0);
  UnixFilters.currentIndex = 0;
};

/**
 * Displays a specific step in the parsed command steps.
 *
 * @function showStep
 * @memberof module:unixfilters
 * @param {number} index - Index of the step to show
 */
UnixFilters.showStep = function (index) {
  if (!UnixFilters.stepData || index > UnixFilters.lastIndex || index < 0) {
    return;
  }
  const step = UnixFilters.stepData[index];
  $("#etape").text(index);
  $("#jsonStep").text(step.command_string);
  if (step.return === 0) {
    if (step.output === "" || step.output === null) {
      document.getElementById("output").style.color = "grey";
      $("#output").text("Sortie vide");
    } else {
      document.getElementById("output").style.color = "white";
      $("#output").text(step.output);
    }
  } else if (step.return != 0) {
    document.getElementById("output").style.color = "red";
    $("#output").text(step.stderr);
  }
};

/**
 * Determines the correct no-op block type based on the block type.
 *
 * @function getNoopTypeFromBlockType
 * @private
 * @param {string} blockType - The type of the original block.
 * @returns {string} The corresponding no-op block type.
 */
function getNoopTypeFromBlockType(blockType) {
  if (blockType.includes("_flag")) {
    return "noop_option_flag";
  } else if (blockType.includes("_field_index")) {
    return "noop_option_field_index";
  } else if (blockType.startsWith("text")) {
    return "noop_text";
  }
  return "noop_command";
}

const optionTooltips = {
  cat: {},
  cut: {
    f: {
      field_index: "cut : sélectionner des champs spécifiques",
      case: "lower",
    },
    b: {
      field_index: "cut : sélectionner des octets spécifiques",
      case: "lower",
    },
    c: {
      field_index: "cut : sélectionner des caractères spécifiques",
      case: "lower",
    },
    d: {
      field_index:
        "cut : définir le délimiteur de champ (par défaut : tabulation)",
      case: "lower",
    },
  },
  grep: {
    v: {
      flag: "grep : afficher les lignes qui ne contiennent pas le motif",
      case: "lower",
    },
    r: {
      flag: "grep : rechercher récursivement dans les sous-dossiers",
      case: "lower",
    },
    l: {
      flag: "grep : afficher uniquement les noms des fichiers contenant le motif",
      case: "lower",
    },
    i: { flag: "grep : ignorer la casse", case: "lower" },
    w: { flag: "grep : recherche le motif comme mot entier", case: "lower" },
    n: {
      flag: "grep : afficher les numéros de ligne pour chaque correspondance",
      case: "lower",
    },
    c: {
      flag: "grep : afficher le nombre de lignes correspondant au motif",
      case: "lower",
    },
    f: {
      flag: "grep : interprète les motifs comme un string, pas un regex",
      case: "upper",
    },
  },
  head: {
    n: {
      field_index: "head : afficher les n premières lignes (par défaut : 10)",
      case: "lower",
    },
    c: { field_index: "head : afficher les n premiers octets", case: "lower" },
  },
  sort: {
    u: { flag: "sort : supprimer les lignes dupliquées", case: "lower" },
    n: { flag: "sort : trier par valeur numérique", case: "lower" },
    r: { flag: "sort : trier dans l’ordre inverse", case: "lower" },
    k: {
      field_index: "sort : trier selon une colonne spécifique",
      case: "lower",
    },
  },
  tail: {
    n: {
      field_index: "tail : afficher les n dernières lignes (par défaut : 10)",
      case: "lower",
    },
    c: { field_index: "tail : afficher les n derniers octets", case: "lower" },
  },
  tee: {
    a: { flag: "tee : ajouter au fichier au lieu de l’écraser", case: "lower" },
  },
  tr: {
    d: { flag: "tr : supprimer les caractères spécifiés", case: "lower" },
    s: {
      flag: "tr : remplacer les répétitions consécutives par une seule",
      case: "lower",
    },
  },
  uniq: {
    c: {
      flag: "uniq : afficher le nombre d’occurrences de chaque ligne",
      case: "lower",
    },
  },
  wc: {
    c: { flag: "wc : compter le nombre de bytes (octets)", case: "lower" },
    m: { flag: "wc : compter le nombre de caractères", case: "lower" },
    w: { flag: "wc : compter le nombre de mots", case: "lower" },
    l: { flag: "wc : compter le nombre de lignes", case: "lower" },
  },
  sed: {
    i: {
      flag: "sed : modifier les fichiers en place (sans redirection)",
      case: "lower",
    },
    n: {
      flag: "sed : supprimer l'affichage automatique (utiliser avec `p`)",
      case: "lower",
    },
    r: {
      flag: "sed : activer les expressions régulières étendues (ERE)",
      case: "lower",
    },
  },
};
