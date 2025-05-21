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
      },
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
        console.log("json loaded after load", subTask.context.unixfilters && subTask.context.unixfilters.stepData);
      }
    });
  
    subTask.step = function() {
      UnixFilters.nextStep();
    };
  
    subTask.backToFirst = function() {
      UnixFilters.stepIndex = 0;
      $('#etape').text(0);
      $('#output').text('');
    };
  
    subTask.play = function() {
      const playNext = () => {
        if (UnixFilters.stepIndex < UnixFilters.stepData.length) {
          UnixFilters.nextStep();
          setTimeout(playNext, 300); 
        }
      };
      playNext();
    };
  }
  initWrapper(initTask, ["easy"], null);
