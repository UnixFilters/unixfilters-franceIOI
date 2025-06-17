var jsonGenerator = new Blockly.Generator("JSON");

jsonGenerator.ORDER_ATOMIC = 0;
jsonGenerator.ORDER_NONE = 0;

jsonGenerator.scrub_ = function (block, code) {
  // Strip comments.
  const commentCode = this.scrubNakedValue(block.getCommentText()) || "";
  const codeWithComments = commentCode ? commentCode + "\n" + code : code;
  return codeWithComments;
};

jsonGenerator.scrubNakedValue = function (line) {
  // Strip single line comments.
  const commentIndex = line.indexOf("//");
  if (commentIndex === -1) {
    return line;
  }
  return line.substring(0, commentIndex);
};

jsonGenerator.robot_start = function (block) {
  return "";
};

function makeCommandGenerator(commandName) {
  return function (block) {
    const paramBloc = block.getInputTargetBlock("PARAM_0") || null;
    const [options, filename] = extractChainedBlocks(paramBloc);
    const parts = [commandName, ...options];
    if (filename) {
      parts.push(filename);
    }
    return parts.join(" ") + " ";
  };
}

// test avec les séquentiels
jsonGenerator.cat = makeCommandGenerator("cat");
jsonGenerator.sort = makeCommandGenerator("sort");
jsonGenerator.head = makeCommandGenerator("head");

jsonGenerator.grep = function (block) {
  const pattern = block.getFieldValue("PARAM_0");
  const optionBlock = block.getInputTargetBlock("PARAM_OPTION");
  const [options, filename] = extractChainedBlocks(optionBlock);
  const optionString = options.join(" ");
  return `grep ${pattern} ${optionString} ${filename} `;
};

jsonGenerator.filename = function (block) {
  const filename = block.getFieldValue("PARAM_0");
  return `${filename}`;
};

function extractChainedBlocks(chainedBlock) {
  const arguments = [];
  let filename = "";
  let current = chainedBlock;
  while (current) {
    if (current.type.startsWith("option_")) {
      const flag = "-" + current.type.substring(7);
      // todo: find another method for options with column index
      if (current.type == "option_k" || current.type == "option_n_number") {
        const index = current.getFieldValue("COLUMN_INDEX");
        arguments.push(flag + index);
      } else {
        arguments.push(flag);
      }
    } else {
      const arg = current.getFieldValue("PARAM_0");
      filename = arg;
    }
    current = current.getInputTargetBlock("PARAM_0");
  }
  return [arguments, filename];
}

jsonGenerator.option_i = function () {
  return "-i";
};

jsonGenerator.option_v = function () {
  return "-v";
};

jsonGenerator.option_n = function () {
  return "-n";
};

jsonGenerator.option_c = function () {
  return "-c";
};

jsonGenerator.option_r = function () {
  return "-r";
};

jsonGenerator.option_u = function () {
  return "-u";
};

jsonGenerator.option_k = function (block) {
  const columnIndex = block.getFieldValue("PARAM_0");
  console.log("column index", columnIndex);
  return `-k${columnIndex}`;
};

jsonGenerator.option_n_number = function (block) {
  const columnIndex = block.getFieldValue("PARAM_0");
  console.log("column index", columnIndex);
  return `-n${columnIndex}`;
};

jsonGenerator.robot_start = function (block) {
  let code = "";
  let child = block.getNextBlock();
  while (child) {
    const snippet = jsonGenerator.blockToCode(child, false);
    // if the block name doesn't start with 'option' it's a command
    // todo: improve the way it's checked
    const currentBlockIsCommand = !child.type.startsWith("option_");
    let prev =
      child.previousConnection && child.previousConnection.targetBlock?.();
    if (currentBlockIsCommand && prev.type != "robot_start") {
      code += "| ";
    }
    code += Array.isArray(snippet) ? snippet[0] : snippet;
    code += "";
    child = child.getNextBlock();
  }
  return code;
};
