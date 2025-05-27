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
    "<button id='backToBeginning' onclick='UnixFilters.backToBeginning()'>Reset</button>" +
      "<button id='play' onclick='UnixFilters.play()'>Play</button>" +
      "<button id='step-by-step' onclick='UnixFilters.nextStep()'>Step by step</button>" +
      "<button id='goToEnd' onclick='UnixFilters.end()'>End</button>" +
      "<h3> Code généré</h3><pre id='generatedCode'></pre><h3>Sortie courante</h3><pre id='jsonStep'></pre><pre id='output'></pre>" +
      "<pre id='commandInput'></pre>" +
      "<button onclick='UnixFilters.sendCommandToServer(document.getElementById(\"generatedCode\").innerText)'>Lancer la commande</button>"
  );
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
};

UnixFilters.sendCommandToServer = async function (commandString) {
  try {
    console.log(" sending ", commandString);
    const response = await fetch("http://localhost:3000/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command: commandString }),
    });
    if (!response.ok) {
      throw new Error("Error sending the request to the server");
    }

    const jsonData = await response.json();
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
