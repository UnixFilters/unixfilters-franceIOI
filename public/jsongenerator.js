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
    const [args] = extractChainedBlocksForCodeShownToUser(paramBloc);
    const parts = [commandName, ...args];
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
  const pattern = block.getFieldValue("PARAM_1");
  const optionBlock = block.getInputTargetBlock("PARAM_0");
  const [args] = extractChainedBlocksForCodeShownToUser(optionBlock);
  const optionString = args.join(" ");
  return `grep ${pattern} ${optionString} `;
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

function removeEventualQuotes(value) {
  if (
    (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  } else {
    return value;
  }
}

function getFieldValue(block, fieldname, isForLibrary) {
  const value = block.getFieldValue(fieldname).trim();
  return isForLibrary ? removeEventualQuotes(value) : value;
}

function extractChainedBlocksForCode(chainedBlock, isForLibrary = false) {
  const args = [];
  let current = chainedBlock;

  while (current) {
    if (current.type.startsWith("option_")) {
      const flag = "-" + current.type.substring(7, 8);

      if (
        current.type.includes("field_index") ||
        current.type.includes("delimiter")
      ) {
        const value = getFieldValue(current, "PARAM_1", isForLibrary);

        if (value !== "") {
          args.push(flag);
          args.push(value);
        } else {
          args.push(flag);
        }
      }
      // If it's an option without input
      else {
        args.push(flag);
      }
    }
    // For the block text and the pattern in grep
    else if (current.type === "text_input" || current.type === "grep") {
      const text = getFieldValue(current, "PARAM_1", isForLibrary);
      args.push(text);
    } else if (current.type === "symbol_greater_than") {
      args.push(jsonGenerator.symbol_greater_than());
    } else if (current.type === "symbol_less_than") {
      args.push(jsonGenerator.symbol_less_than());
    } else if (current.type === "symbol_even_greater_than") {
      args.push(jsonGenerator.symbol_even_greater_than());
    }

    current = current.getInputTargetBlock("PARAM_0");
  }
  return [args];
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
    // Only command blocks can be connecter horizontally
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
