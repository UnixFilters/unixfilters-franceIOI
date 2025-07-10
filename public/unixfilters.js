var UnixFilters = {
  functions: {},
  currentOutput: null,
  pipedOutput: false,
};

UnixFilters.reset = function (taskInfos) {
  UnixFilters.currentOutput = null;
  UnixFilters.pipedOutput = false;
};

// Define the display
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

// Refreshes the tooltip of an option block based on its parent command block
function getDynamicTooltip(blockType) {
  // Check if blocks are sorted into categories
  const groupByCategory = window.unixfilters_groupByCategory ?? false;
  // Get the type (flag/field_index) and the command name
  const parts = blockType.split("_");
  if (parts.length < 3) return "";
  const flag = parts[1];
  const type = parts[2] === "flag" ? "flag" : "field_index";
  const commandName = parts[parts.length - 1];

  // If the toolbox is organised in catgories, only show the tooltip specific to the option + command name
  if (groupByCategory) {
    for (const [command, options] of Object.entries(optionTooltips)) {
      if (command == commandName && options[flag] && options[flag][type]) {
        return options[flag][type];
      }
    }
    return `Option -${flag}`;
  }
  // Else, show the commands which the option can be used with
  else {
    const usages = ["Utilisable avec :"];
    for (const [command, options] of Object.entries(optionTooltips)) {
      if (options[flag] && options[flag][type]) {
        usages.push(`${options[flag][type]}`);
      }
    }
    return usages.length ? usages.join("\n") : `Option -${flag}`;
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
        if (block && block.type.startsWith("option_")) {
          updateOptionBlockTooltips(context);
        }
      }
    });
    context._tooltipListenerRegistered = true;
  }
};

function updateOptionBlockTooltips(context) {
  const blocks = context.blocklyHelper.workspace.getAllBlocks();
  for (const block of blocks) {
    if (block.type.startsWith("option_")) {
      const newTooltip = getDetailedTooltip(block.type);
      block.setTooltip(newTooltip);
    }
  }
}

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

// Fills empty input fields with no-op blocks
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

// Removes no-op blocks
UnixFilters.removeNoops = function (context) {
  context.blocklyHelper.workspace.getAllBlocks().forEach(function (block) {
    if (block.type.startsWith("noop")) {
      block.dispose();
    }
  });
};

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

    console.log("JSON DATA: ", jsonData.steps);

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

// Parses the JSON data returned and prepares the steps
UnixFilters.parseJson = function (jsonData) {
  UnixFilters.stepData = Object.values(jsonData.steps);
  UnixFilters.currentIndex = 0;
  UnixFilters.lastIndex = Object.values(jsonData.steps).length - 1;
};

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

UnixFilters.end = function () {
  UnixFilters.showStep(UnixFilters.lastIndex);
  UnixFilters.currentIndex = UnixFilters.lastIndex;
};

UnixFilters.backToBeginning = function () {
  UnixFilters.showStep(0);
  UnixFilters.currentIndex = 0;
};

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

// Utility function to determine the type of no-op block to create based on the block type
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
  cut: {
    f: { field_index: "cut : sélectionner des champs spécifiques" },
    b: { field_index: "cut : sélectionner des octets spécifiques" },
    c: { field_index: "cut : sélectionner des caractères spécifiques" },
    d: {
      field_index:
        "cut : définir le délimiteur de champ (par défaut : tabulation)",
    },
  },
  grep: {
    v: { flag: "grep : afficher les lignes qui ne contiennent pas le motif" },
    r: { flag: "grep : rechercher récursivement dans les sous-dossiers" },
    l: {
      flag: "grep : afficher uniquement les noms des fichiers contenant une correspondance",
    },
    i: { flag: "grep : ignorer la casse" },
    w: { flag: "grep : faire correspondre le motif comme un mot entier" },
    n: {
      flag: "grep : afficher les numéros de ligne pour chaque correspondance",
    },
    c: { flag: "grep : afficher le nombre de lignes correspondant au motif" },
  },
  head: {
    n: {
      field_index: "head : afficher les n premières lignes (par défaut : 10)",
    },
    c: { field_index: "head : afficher les n premiers octets" },
  },
  sort: {
    u: { flag: "sort : supprimer les lignes dupliquées" },
    n: { flag: "sort : trier selon une valeur numérique" },
    r: { flag: "sort : trier dans l’ordre inverse" },
    k: { field_index: "sort : trier selon une colonne spécifique" },
  },
  tail: {
    n: {
      field_index: "tail : afficher les n dernières lignes (par défaut : 10)",
    },
    c: { field_index: "tail : afficher les n derniers octets" },
  },
  tee: {
    a: { flag: "tee : ajouter au fichier au lieu de l’écraser" },
  },
  tr: {
    d: { flag: "tr : supprimer les caractères spécifiés" },
    s: { flag: "tr : remplacer les occurrences répétées par une seule" },
  },
  uniq: {
    c: { flag: "uniq : afficher le nombre d’occurrences de chaque ligne" },
  },
  wc: {
    c: { flag: "wc : nombre de bytes (octets)" },
    m: { flag: "wc : nombre de caractères" },
    w: { flag: "wc : nombre de mots" },
    l: { flag: "wc : nombre de lignes" },
  },
  sed: {
    i: { flag: "sed : modifier les fichiers en place (sans redirection)" },
    n: { flag: "sed : supprimer l'affichage automatique (utiliser avec `p`)" },
    r: { flag: "sed : activer les expressions régulières étendues (ERE)" },
  },
};
