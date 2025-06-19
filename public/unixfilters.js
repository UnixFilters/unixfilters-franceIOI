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
      "<button id='play'>Play</button>" +
      "<button id='step-by-step'>Step by step</button>" +
      "<button id='goToEnd'>End</button>" +
      "<h3> Code généré</h3><pre id='generatedCode'></pre><h3>Sortie courante</h3><pre id='jsonStep'></pre><pre id='output'></pre>" +
      "<pre id='commandInput'></pre>" +
      "<button id='launchCommand'>Lancer la commande</button>"
  );

  $("#backToBeginning").on("click", UnixFilters.backToBeginning);
  $("#play").on("click", UnixFilters.play);
  $("#step-by-step").on("click", UnixFilters.nextStep);
  $("#goToEnd").on("click", UnixFilters.end);
  $("#launchCommand").on("click", function () {
    UnixFilters.fillEmptyOptionInputs(context);
    UnixFilters.sendCommandToServer();
  });
};

UnixFilters.onChange = function (context) {
  var programBlock = context.blocklyHelper.workspace
    .getTopBlocks(true)
    .find(function (block) {
      return block.type === "robot_start";
    });

  const generatedCode = jsonGenerator.blockToCode(programBlock, false);
  $("#generatedCode").text(
    Array.isArray(generatedCode) ? generatedCode[0] : generatedCode
  );
  console.log(
    "python code generated",
    task.displayedSubTask.blocklyHelper.getCode("python", null, true)
  );
};

UnixFilters.fillEmptyOptionInputs = function (context) {
  console.log("fillEmptyOptionInput");
  const allBlocks = context.blocklyHelper.workspace.getAllBlocks(false);

  for (const block of allBlocks) {
    console.log("block", block.type);
    const input = block.getInput("PARAM_0");
    if (input && !input.connection.isConnected()) {
      const dummyBlock =
        context.blocklyHelper.workspace.newBlock("noop_option_flag");
      console.log("dummy", dummyBlock);
      dummyBlock.initSvg();
      dummyBlock.render();
      input.connection.connect(dummyBlock.outputConnection);
      // if (block.type == "option_flag") {
      //   const dummyBlock =
      //     context.blocklyHelper.workspace.newBlock("noop_option_flag");
      //   console.log("dummy", dummyBlock);
      //   dummyBlock.initSvg();
      //   dummyBlock.render();
      //   input.connection.connect(dummyBlock.outputConnection);
      // } else if (block.type == "option_field_index") {
      //   const dummyBlock = context.blocklyHelper.workspace.newBlock(
      //     "noop_option_field_index"
      //   );
      //   console.log("dummy", dummyBlock);
      //   dummyBlock.initSvg();
      //   dummyBlock.render();
      //   input.connection.connect(dummyBlock.outputConnection);
      // } else {
      //   const dummyBlock =
      //     context.blocklyHelper.workspace.newBlock("noop_command");
      //   console.log("dummy", dummyBlock);
      //   dummyBlock.initSvg();
      //   dummyBlock.render();
      //   input.connection.connect(dummyBlock.outputConnection);
      // }
    }
  }
};

UnixFilters.removeNoops = function (context) {
  console.log("removeNoop");
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
      // UnixFilters.parseJson(errorData);
      // $("#output").text(errorData.error);
      console.error("Error response:", errorData);
      throw new Error(
        `Error sending the request to the server: ${errorData.error}`
      );
    }

    const jsonData = await response.json();
    console.log("JSON DATA", jsonData);
    UnixFilters.parseJson(jsonData);
    UnixFilters.showStep(UnixFilters.lastIndex);
  } catch (error) {
    console.error("Error when sending command:", error);
  }
};

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

UnixFilters.play = async function () {
  if (UnixFilters.currentIndex == UnixFilters.lastIndex) {
    return;
  }
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  for (let i = UnixFilters.currentIndex; i <= UnixFilters.lastIndex; i++) {
    UnixFilters.showStep(i);
    UnixFilters.currentIndex = i;
    await delay(500);
  }
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
  $("#jsonStep").text("command: " + step.command_string);
  if (step.return === 0) {
    document.getElementById("output").style.color = "white";
    $("#output").text(step.output);
  } else {
    document.getElementById("output").style.color = "red";
    $("#output").text(step.stderr);
  }
};
