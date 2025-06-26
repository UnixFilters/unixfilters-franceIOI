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
    const [arguments] = extractChainedBlocksForCodeShownToUser(paramBloc);
    const parts = [commandName, ...arguments];
    return parts.join(" ") + " ";
  };
}

// Generates code for commands
jsonGenerator.cat = makeCommandGenerator("cat");
jsonGenerator.sort = makeCommandGenerator("sort");
jsonGenerator.head = makeCommandGenerator("head");
jsonGenerator.cut = makeCommandGenerator("cut");
jsonGenerator.tail = makeCommandGenerator("tail");
jsonGenerator.tee = makeCommandGenerator("tee");
jsonGenerator.tr = makeCommandGenerator("tr");
jsonGenerator.uniq = makeCommandGenerator("uniq");
jsonGenerator.wc = makeCommandGenerator("wc");
jsonGenerator.sed = makeCommandGenerator("sed");

jsonGenerator.grep = function (block) {
  const pattern = block.getFieldValue("PATTERN");
  const optionBlock = block.getInputTargetBlock("PARAM_0");
  const [arguments] = extractChainedBlocksForCodeShownToUser(optionBlock);
  const optionString = arguments.join(" ");
  return `grep ${pattern} ${optionString} `;
};

jsonGenerator.filename = function (block) {
  const filename = block.getFieldValue("PARAM_1");
  return `${filename}`;
};

jsonGenerator.text_input = function (block) {
  const text = block.getFieldValue("PARAM_1");
  return `${text}`;
};

jsonGenerator.symbol_greater_than = function () {
  return `>`;
};

jsonGenerator.symbol_even_greater_than = function () {
  return `>>`;
};

jsonGenerator.symbol_less_than = function () {
  return `<`;
};

function extractChainedBlocksForCode(chainedBlock, isForLibrary = false) {
  const arguments = [];
  let current = chainedBlock;

  while (current) {
    if (current.type.startsWith("option_")) {
      const flag = "-" + current.type.substring(7, 8);

      if (
        current.type.includes("field_index") ||
        current.type.includes("delimiter")
      ) {
        let value = current.getFieldValue("PARAM_1").trim();

        if (isForLibrary && value === "") {
          arguments.push(flag);
        } else if (
          isForLibrary &&
          ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"')))
        ) {
          arguments.push(flag);
          arguments.push(value.slice(1, -1));
        } else {
          arguments.push(flag);
          arguments.push(value);
        }
      } else {
        arguments.push(flag);
      }
    } else if (current.type === "filename") {
      const filename = current.getFieldValue("PARAM_1");
      arguments.push(filename);
    } else if (current.type === "text_input") {
      const text = current.getFieldValue("PARAM_1");
      arguments.push(text);
    } else if (current.type === "symbol_greater_than") {
      arguments.push(jsonGenerator.symbol_greater_than());
    } else if (current.type === "symbol_less_than") {
      arguments.push(jsonGenerator.symbol_less_than());
    } else if (current.type === "symbol_even_greater_than") {
      arguments.push(jsonGenerator.symbol_even_greater_than());
    }

    current = current.getInputTargetBlock("PARAM_0");
  }

  return [arguments];
}

function extractChainedBlocksForCodeShownToUser(chainedBlock) {
  return extractChainedBlocksForCode(chainedBlock, false);
}

function extractChainedBlocksForCodeSentToLib(chainedBlock) {
  return extractChainedBlocksForCode(chainedBlock, true);
}

jsonGenerator.robot_start = function (block) {
  let code = "";
  let child = block.getNextBlock();
  while (child) {
    const snippet = jsonGenerator.blockToCode(child, false);
    // if the block name doesn't start with 'option' it's a command
    // not true anymore bc there are new blocks
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
