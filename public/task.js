function initTask(subTask) {
  subTask.gridInfos = {
    hideSaveOrLoad: false,
    conceptViewer: false,
    actionDelay: 200,
    includeBlocks: {
      groupByCategory: true,
      generatedBlocks: {
        unixfilters: [
          "symbol_greater_than",
          "symbol_even_greater_than",
          "symbol_less_than",
          "text_input",
          "cat",
          "cut",
          "grep",
          "head",
          "sed",
          "sort",
          "tail",
          "tee",
          "tr",
          "uniq",
          "wc",
          // CUT
          "option_b_field_index_cut",
          "option_c_field_index_cut",
          "option_d_field_index_cut",
          "option_f_field_index_cut",

          // GREP
          "option_c_flag_grep",
          "option_i_flag_grep",
          "option_l_flag_grep",
          "option_n_flag_grep",
          "option_r_flag_grep",
          "option_v_flag_grep",
          "option_w_flag_grep",

          // HEAD
          "option_c_field_index_head",
          "option_n_field_index_head",

          // SORT
          "option_k_field_index_sort",
          "option_n_flag_sort",
          "option_r_flag_sort",
          "option_u_flag_sort",

          // TAIL
          "option_c_field_index_tail",
          "option_n_field_index_tail",

          // TEE
          "option_a_flag_tee",

          // TR
          "option_d_flag_tr",
          "option_s_flag_tr",

          // UNIQ
          "option_c_flag_uniq",

          // WC
          "option_c_flag_wc",
          "option_l_flag_wc",
          "option_m_flag_wc",
          "option_w_flag_wc",

          // SED
          "option_i_flag_sed",
          "option_n_flag_sed",
          "option_r_flag_sed",

          // "option_i_flag",
          // "option_n_flag",
          // "option_c_flag",
          // "option_r_flag",
          // "option_u_flag",
          // "option_n_field_index",
          // "option_k_field_index",
          // "option_c_field_index",
          // "option_d_field_index",
          // // "option_t_field_index",
          // "option_f_field_index",
          // "option_b_field_index",
          // "option_a_flag",
          // "option_d_flag",
          // "option_l_flag",
          // "option_w_flag",
          // "option_m_flag",
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
