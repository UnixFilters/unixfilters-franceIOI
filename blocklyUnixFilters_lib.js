// This is a unixfilters of library for use with quickAlgo.

var getContext = function(display, infos, curLevel) {
   // Local language strings for each language
   var localLanguageStrings = {
      fr: { // French strings
         label: {
            // Labels for the blocks
            cat: "cat",
            grep: "grep",
            grep_filename: "grep",
            pipe: "|"
           },
           code: {
            // Names of the functions in Python, or Blockly translated in JavaScript
            cat: "cat",
            grep: "grep",
            grep_filename: "grep",
            pipe: "pipe"
         },
         description: {
            // Descriptions of the functions in Python (optional)
            cat: "cat file.txt : affiche le contenu du fichier file.txt",
            grep: "grep 'mot' : affiche les lignes d'entrée contenant le mot 'mot'",
            grep_filename: "grep 'mot' file.txt : affiche les lignes du fichier file.txt contenant le mot 'mot'",
            pipe: "pipe : redirige la sortie d'une commande vers une autre commande"
         },
         constant: {
         },
         startingBlockName: "Ligne de commande", // Name for the starting block
         messages: {
            outputCorrect: "Exécution terminée.",
            noPreviousOutput: "This command must get the output from another command.",
            previousOutputNotPiped: "This command must follow a pipe.",
            previousOutputAlreadyPiped: "Pipe has already been used."
         }
      }
   }

   // Create a base context
   var context = quickAlgoContext(display, infos);
   // Import our localLanguageStrings into the global scope
   var strings = context.setLocalLanguageStrings(localLanguageStrings);

   // Some data can be made accessible by the library through the context object
   context.unixfilters = {};

   // A context must have a reset function to get back to the initial state
   context.reset = function(taskInfos) {
      UnixFilters.reset(taskInfos);
      context.success = false;

      if (context.display) {
         context.resetDisplay();
      }
   };

   // Reset the context's display
   context.resetDisplay = function() {
      UnixFilters.resetDisplay(context);
      UnixFilters.onChange(context);
      context.blocklyHelper.updateSize();
      context.updateScale();
   };

   context.loadJsonData = function () {
      const jsonText = document.getElementById('test-json').textContent;
      const data = JSON.parse(jsonText);
      UnixFilters.parseJson(data);
      console.log("json loaded", data);
    };
    context.loadJsonData();
    
   context.onChange = function() {
      UnixFilters.onChange(context);
   }

   // Update the context's display to the new scale (after a window resize for instance)
   context.updateScale = function() {
      if (!context.display) {
         return;
      }
   };

   // When the context is unloaded, this function is called to clean up
   // anything the context may have created
   context.unload = function() {
      // Do something here
      if (context.display) {
         // Do something here
      }
   };

   /***** Functions *****/
   // For each function in UnixFilters.functions, we define a function
   // that will be called when the block is executed

   for (var funcName in UnixFilters.functions) {
      context.unixfilters[funcName] = (function(funcName) {
         return function() {
            var callback = arguments[arguments.length - 1];
            var otherArgs = Array.prototype.slice.call(arguments, 0, -1);
            UnixFilters.functions[funcName].apply(context, otherArgs);
            context.runner.waitDelay(callback);
         }
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

   Blockly.Blocks['grep_mutator_container'] = {
      init: function() {
         this.jsonInit(  {
            type: 'grep_mutator_container',
            message0: 'Options grep %1 %2',
            args0: [
              { type: 'input_dummy' },
              {
                type: 'input_statement',
                name: 'OPTIONS',
                check: 'grep_option'
              }
            ],
            colour: 285,
            tooltip: 'Ajouter/supprimer des options pour grep',
            enableContextMenu: false
          });
      }
   };
   Blockly.Blocks['grep_mutator_option'] = {
      init: function() {
         this.jsonInit(  {
            type: 'grep_mutator_option',
            message0: 'option',
            nextStatement: 'grep_option',
            previousStatement: 'grep_option',
            colour: 285,
            tooltip: 'Une option (-v, -i,...)',
            enableContextMenu: false
          });
      }
   };

   function makeGrepBlock(hasFilename) {
      // Function to make a grep block
      var blockJson = {
         name: hasFilename ? "grep_filename" : "grep",
         category: "actions",
         colour: 285,
         args0: [
            {
               type: 'field_input',
               name: 'PARAM_0',
               text: 'pattern'
            }
         ]
      };

      if (hasFilename) {
         blockJson.args0.push({
            type: 'field_input',
            name: 'PARAM_1',
            text: 'filename'
         });
      }

      var fullBlock = {
         init: function() {
            this.jsonInit(blockJson);
            this.setMutator(new Blockly.Mutator(['grep_mutator_option']))
         },
         optionCount_: 0,
         mutationToDom: function () {
           const container = document.createElement('mutation')
           container.setAttribute('options', this.optionCount_)
           return container
         },
         domToMutation: function (xmlElement) {
           this.optionCount_ = parseInt(xmlElement.getAttribute('options'), 10)
           this.updateShape_()
         },
       
         decompose: function (workspace) {
           const containerBlock = workspace.newBlock('grep_mutator_container')
           containerBlock.initSvg()
           let connection = containerBlock.getInput('OPTIONS').connection
           for (let i = 0; i < this.optionCount_; i++) {
             const optionBlock = workspace.newBlock('grep_mutator_option')
             optionBlock.initSvg()
             optionBlock.valueConnection_ = this.getInput(
               'OPTIONS_SLOT' + i
             ).connection.targetConnection
             connection.connect(optionBlock.previousConnection)
             connection = optionBlock.nextConnection
           }
           return containerBlock
         },
       
         compose: function (containerBlock) {
           let optionBlock = containerBlock.getInputTargetBlock('OPTIONS')
           const connections = []
           while (optionBlock) {
             connections.push(optionBlock.valueConnection_)
             optionBlock =
               optionBlock.nextConnection && optionBlock.nextConnection.targetBlock()
           }
           this.optionCount_ = connections.length
           this.updateShape_()
           for (let i = 0; i < connections.length; i++) {
             if (connections[i]) {
               this.getInput('OPTIONS_SLOT' + i).connection.connect(connections[i])
             }
           }
         },
         updateShape_: function () {
           if (this.getInput('OPTIONS_SLOT0')) {
             let i = 0
             while (this.getInput('OPTIONS_SLOT' + i)) {
               this.removeInput('OPTIONS_SLOT' + i)
               i++
             }
           }
           for (let i = 0; i < this.optionCount_; i++) {
             this.appendStatementInput('OPTIONS_SLOT' + i)
               .setCheck('grep_option')
               .appendField('option')
           }
           if (this.getInput('PATTERN')) {
             this.moveInputBefore('PATTERN', null)
           }
         }
      }

      var generateCode = function() {
         var pattern = this.getFieldValue('PARAM_0');
         var filename = hasFilename ? this.getFieldValue('PARAM_1') : null;
         var options = [];
         for (var i = 0; i < this.optionCount_; i++) {
            var optionBlock = this.getInputTargetBlock('OPTIONS_SLOT' + i);
            if (optionBlock) {
               var optionType = optionBlock.type;
               var flag = "-" + optionType.substring(7);
               options.push(flag);
            }
         }
         return "grep(" + JSON.stringify(options) + ", " + JSON.stringify(pattern) + (hasFilename ? ", " + JSON.stringify(filename) : "") + ");";
      }

      return {
         name: blockJson.name,
         category: blockJson.category,
         blocklyJson: blockJson,
         fullBlock: fullBlock,
         codeGenerators: {
            JavaScript: generateCode,
            Python: generateCode
         }
      };
   }

   function makeOptionBlock(flag) {
      // Make a block for an option
      context.customBlocks.unixfilters.actions.push({
         name: "option_" + flag,
         blocklyJson: {
            name: "-" + flag,
            message0: "-" + flag,
            colour: 225
         }
      });

      context.unixfilters["option_" + flag] = function() {
         UnixFilters.currentOptions.push("-" + flag);
      };
   }

   context.customBlocks = {
      // Define our blocks for our namespace "unixfilters"
      unixfilters: {
         // Categories are reflected in the Blockly menu
         actions: [
            {
               name: "cat",
               blocklyJson: {
                  colour: 250,
                  args0: [{
                     type: 'field_input',
                     name: 'PARAM_0',
                     text: 'filename'
                  }]
               }
            },
            makeGrepBlock(false),
            makeGrepBlock(true),
            {
               name: "pipe",
               blocklyJson: {
                  colour: 200
               }
            }
         ]
      }
   };

   var optionBlocks = ["v", "i", "n", "c"]
   for (var i = 0; i < optionBlocks.length; i++) {
      makeOptionBlock(optionBlocks[i]);
   }


   // Color indexes of block categories (as a hue in the range 0–420)
   context.provideBlocklyColours = function() {
      return {
         categories: {
            actions: 0,
            sensors: 100
         }
      };
   };

   context.customConstants = {
   };

   return context;
}

if(window.quickAlgoLibraries) {
   quickAlgoLibraries.register('unixfilters', getContext);
} else {
   if(!window.quickAlgoLibrariesList) { window.quickAlgoLibrariesList = []; }
   window.quickAlgoLibrariesList.push(['unixfilters', getContext]);
}
