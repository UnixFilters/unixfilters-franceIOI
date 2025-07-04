function initTask(subTask) {
  subTask.gridInfos = {
    hideSaveOrLoad: false,
    conceptViewer: false,
    actionDelay: 200,
    includeBlocks: {
      generatedBlocks: {
        unixfilters: {
          commands: true,
          options: true,
          symbols: true,
          noop: true,
          inputs: true,
        },
      },
      singleBlocks: ["text"],
    },
    maxInstructions: 200,
    maxIter: { basic: 500000, easy: 500000, medium: 60000, hard: 10000 },
    checkEndEveryTurn: false,
    checkEndCondition: function (context, lastTurn) {
      if (!lastTurn) return;

      context.success = false;
      throw window.languageStrings.messages.outputCorrect;
    },
    // startingExample
    computeGrade: function (context, message) {
      var rate = context.success ? 1 : 0;
      return {
        successRate: rate,
        message: message,
      };
    },
  };

  subTask.data = {
    easy: [""],
  };
  console.log(subTask);
  initBlocklySubTask(subTask);
}

initWrapper(initTask, ["easy"], null);
