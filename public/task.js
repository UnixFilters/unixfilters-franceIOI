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
          "option_b_field_index_cut_lower",
          "option_c_field_index_cut_lower",
          "option_d_field_index_cut_lower",
          "option_f_field_index_cut_lower",

          // GREP
          "option_c_flag_grep_lower",
          "option_i_flag_grep_lower",
          "option_l_flag_grep_lower",
          "option_n_flag_grep_lower",
          "option_r_flag_grep_lower",
          "option_v_flag_grep_lower",
          "option_w_flag_grep_lower",
          "option_f_flag_grep_upper",

          // HEAD
          "option_c_field_index_head_lower",
          "option_n_field_index_head_lower",

          // SORT
          "option_k_field_index_sort_lower",
          "option_n_flag_sort_lower",
          "option_r_flag_sort_lower",
          "option_u_flag_sort_lower",

          // TAIL
          "option_c_field_index_tail_lower",
          "option_n_field_index_tail_lower",

          // TEE
          "option_a_flag_tee_lower",

          // TR
          "option_d_flag_tr_lower",
          "option_s_flag_tr_lower",

          // UNIQ
          "option_c_flag_uniq_lower",

          // SED
          "option_i_flag_sed_lower",
          "option_n_flag_sed_lower",
          "option_r_flag_sed_lower",

          // WC
          "option_c_flag_wc_lower",
          "option_l_flag_wc_lower",
          "option_m_flag_wc_lower",
          "option_w_flag_wc_lower",
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
