function initTask(subTask) {
  subTask.gridInfos = {
    hideSaveOrLoad: false,
    conceptViewer: false,
    actionDelay: 200,
    includeBlocks: {
      generatedBlocks: {
        unixfilters: [
          "cat",
          "grep",
          "symbol_greater_than",
          "symbol_even_greater_than",
          "symbol_less_than",
          "text_input",
          "sort",
          "head",
          "cut",
          "tail",
          "tee",
          "tr",
          "uniq",
          "wc",
          "sed",
          "filename",
          "option_i_flag",
          "option_v_flag",
          "option_i_flag",
          "option_n_flag",
          "option_c_flag",
          "option_r_flag",
          "option_u_flag",
          "option_n_field_index",
          "option_k_field_index",
          "option_c_field_index",
          "option_d_delimiter",
          "option_f_field_index",
          "option_a_flag",
          "option_d_flag",
          "option_l_flag",
          "option_w_flag",
          "option_m_flag",
          "option_e_flag",
        ],
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

  initBlocklySubTask(subTask);
}

initWrapper(initTask, ["easy"], null);
