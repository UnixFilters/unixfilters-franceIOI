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
  $("#grid").html(
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
};

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
    console.log("JSON DATA", jsonData);
    $("#output").text(jsonData);

    // UnixFilters.parseJson(jsonData);
    // UnixFilters.showStep(UnixFilters.lastIndex);
  } catch (error) {
    console.error("Error when sending command:", error);
  }
};

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
    if (step.output == "") {
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
  if (blockType.endsWith("_flag")) {
    return "noop_option_flag";
  } else if (blockType.endsWith("_field_index")) {
    return "noop_option_field_index";
  } else if (blockType.startsWith("text")) {
    return "noop_text";
  }
  return "noop_command";
}
