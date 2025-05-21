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

         context.success = false;
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
   initBlocklySubTask(subTask, {
      player: {
         mode: 'player',
         stepDelayMin: 250,
         stepDelayMax: 1500
      },
      afterLoad: function () {
         context.resetDisplay();
         subTask.context.loadJsonData && subTask.context.loadJsonData();

      }
   });

   subTask.step = function () {
      UnixFilters.nextStep();
   };

   subTask.backToFirst = function() {
      UnixFilters.showStep(0);
      UnixFilters.stepIndex = 0;
   };
   
   subTask.goToEnd = function () {
      subTask.setStepDelay(0);
      subTask.play();
   };   

   subTask.play = function () {
      const delay = UnixFilters.stepDelay != null ? UnixFilters.stepDelay : 400;
   
      const playNext = () => {
         if (UnixFilters.stepIndex < UnixFilters.stepData.length) {
            UnixFilters.nextStep();
            setTimeout(playNext, delay);
         }
      };
      playNext();
   };   

   subTask.setStepDelay = function (delay) {
      UnixFilters.stepDelay = delay;
   };   
}
initWrapper(initTask, ["easy"], null);
