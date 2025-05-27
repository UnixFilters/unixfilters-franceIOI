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

// test avec les séquentiels
jsonGenerator.cat = function (block) {
  const filename = block.getFieldValue("PARAM_0");
  return `cat ${filename}`;
};

jsonGenerator.sort = function (block) {
  const filename = block.getFieldValue("PARAM_0");
  return `sort ${filename}`;
};

jsonGenerator.option_filename = function (block) {
  const filename = block.getFieldValue("PARAM_0");
  return `${filename}`;
};

jsonGenerator.grep = function (block) {
  const pattern = block.getFieldValue("PARAM_0");
  const opts = extractGrepOptions(block);
  const optionString = opts.join(" ");
  return `grep ${optionString} ${pattern}`;
};

jsonGenerator.grep_filename = function (block) {
  const pattern = block.getFieldValue("PARAM_0");
  const filename = block.getFieldValue("PARAM_1");
  const opts = extractGrepOptions(block);
  const optionString = opts.join(" ");
  return `grep ${optionString} ${pattern} ${filename}`;
};

function extractGrepOptions(block) {
  const authorizedOptions = new Set([
    "option_i",
    "option_v",
    "option_n",
    "option_c",
  ]);
  const optionFlagsMap = {
    option_i: "-i",
    option_v: "-v",
    option_n: "-n",
    option_c: "-c",
  };

  const opts = [];
  let hasInvalid = false;

  for (let i = 0; i < block.optionCount_; i++) {
    const opt = block.getInputTargetBlock("OPTIONS_SLOT" + i);
    if (!opt) continue;

    if (authorizedOptions.has(opt.type)) {
      opts.push(optionFlagsMap[opt.type]);
    } else {
      opts.push(`[INVALID:${opt.type}]`);
      hasInvalid = true;
    }
  }

  block.setWarningText(
    hasInvalid ? "One or more options are not valid in this command" : null
  );

  return opts;
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
      code += " | ";
    }
    code += Array.isArray(snippet) ? snippet[0] : snippet;
    code += "";
    child = child.getNextBlock();
  }
  return code;
};
