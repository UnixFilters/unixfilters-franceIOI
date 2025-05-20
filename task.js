function initTask(subTask) {
   subTask.gridInfos = {
      hideSaveOrLoad: false,
      conceptViewer: false,
      actionDelay: 200,
      includeBlocks: {
         generatedBlocks: {
            unixfilters: ["cat", "grep", "grep_filename", "pipe", "option_v", "option_i", "option_n", "option_c"]
         },
         singleBlocks: ["text"]
      },
      maxInstructions: 200,
      maxIter: {basic: 500000, easy: 500000, medium: 60000, hard: 10000 },
      checkEndEveryTurn: false,
      checkEndCondition: function(context, lastTurn) {
         if (!lastTurn) return;

         context.success = true;
         throw(window.languageStrings.messages.outputCorrect);
      },
      computeGrade: function(context, message) {
         var rate = context.success ? 1 : 0;
         return {
            successRate: rate,
            message: message
         };
      }
   };

   subTask.data = {
      easy: [''],
   };

   initBlocklySubTask(subTask);
}

initWrapper(initTask, ["easy"], null);
