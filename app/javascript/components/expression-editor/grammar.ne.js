// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function () {
  function id(x) {
    return x[0];
  }
  var grammar = {
    Lexer: undefined,
    ParserRules: [
      { name: "Main", symbols: ["E"] },
      { name: "E", symbols: ["field_expression"], postprocess: (d) => d[0] },
      { name: "E", symbols: ["tag_expression"], postprocess: (d) => d[0] },
      { name: "E", symbols: ["count_expression"], postprocess: (d) => d[0] },
      { name: "E", symbols: ["find_expression"], postprocess: (d) => d[0] },
      {
        name: "E",
        symbols: ["_", { literal: "(" }, "_", "E"],
        postprocess: (d) => d[3],
      },
      {
        name: "E",
        symbols: ["E", "_", { literal: ")" }],
        postprocess: (d) => d[0],
      },
      {
        name: "E",
        symbols: ["_", { literal: "(" }, "_", "E", "_", { literal: ")" }],
        postprocess: (d) => d[3],
      },
      {
        name: "E$string$1",
        symbols: [{ literal: "O" }, { literal: "R" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "E",
        symbols: ["E", "E$string$1", "E"],
        postprocess: (d) => d[3],
      },
      {
        name: "field_expression",
        symbols: ["_", "cursor"],
        postprocess: (d) => ({ results: [], next: ["entity", "exp_type"] }),
      },
      {
        name: "field_expression",
        symbols: ["entity", "cursor"],
        postprocess: (d) => ({
          results: [d[0]].flat().map((e) => ({ type: e.type, value: e.value })),
          next: d[0].next || ["entity", "field"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: ["entity", { literal: "." }, "_", "cursor"],
        postprocess: (d) => ({
          results: [d[0], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["entity", "field"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: ["entity", { literal: "." }, "field", "__", "cursor"],
        postprocess: (d) => ({
          results: [d[0], d[2], , { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["operator"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: [
          "entity",
          { literal: "." },
          "field",
          "__",
          "literals",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[0], d[2], { type: "operator", value: d[4] }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["operator"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: [
          "entity",
          { literal: "." },
          "field",
          "operator",
          "_",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[0], d[2], d[3], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["value"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: [
          "entity",
          { literal: "." },
          "field",
          "operator",
          "value",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[0], d[2], d[3], d[4]]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["value"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: [
          "entity",
          { literal: "." },
          "field",
          "operator",
          "value",
          "__",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[0], d[2], d[3], d[4], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["expression_operator"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: [
          "entity",
          { literal: "." },
          "field",
          "operator",
          "value",
          "__",
          "literals",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[0], d[2], d[3], d[4], { value: d[6] }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["expression_operator"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: ["FIELD", "_", "cursor"],
        postprocess: (d) => ({ results: [], next: ["entity"], type: "field" }),
      },
      {
        name: "field_expression",
        symbols: ["FIELD", "entity", "cursor"],
        postprocess: (d) => ({
          results: [d[1]].flat().map((e) => ({ type: e.type, value: e.value })),
          next: ["entity", "field"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: ["FIELD", "entity", { literal: "." }, "_", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["entity", "field"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: ["FIELD", "entity", { literal: "." }, "field", "__", "cursor"],
        postprocess: (d) => ({
          results: [d[1], d[3], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["operator"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: [
          "FIELD",
          "entity",
          { literal: "." },
          "field",
          "__",
          "literals",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], { type: "operator", value: d[5] }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["operator"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: [
          "FIELD",
          "entity",
          { literal: "." },
          "field",
          "operator",
          "_",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["value"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: [
          "FIELD",
          "entity",
          { literal: "." },
          "field",
          "operator",
          "value",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], d[5]]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["value"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: [
          "FIELD",
          "entity",
          { literal: "." },
          "field",
          "operator",
          "value",
          "__",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], d[5], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["expression_operator"],
          type: "field",
        }),
      },
      {
        name: "field_expression",
        symbols: [
          "FIELD",
          "entity",
          { literal: "." },
          "field",
          "operator",
          "value",
          "__",
          "literals",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], d[5], { value: d[7] }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["expression_operator"],
          type: "field",
        }),
      },
      {
        name: "tag_expression",
        symbols: ["TAG", "_", "cursor"],
        postprocess: (d) => ({ results: [], next: ["entity"], type: "tag" }),
      },
      {
        name: "tag_expression",
        symbols: ["TAG", "entity", "cursor"],
        postprocess: (d) => ({
          results: [d[1]].flat().map((e) => ({ type: e.type, value: e.value })),
          next: ["entity", "category"],
          type: "tag",
        }),
      },
      {
        name: "tag_expression",
        symbols: ["TAG", "entity", { literal: "." }, "_", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["entity", "category"],
          type: "tag",
        }),
      },
      {
        name: "tag_expression",
        symbols: [
          "TAG",
          "entity",
          { literal: "." },
          "category",
          "__",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["tag_operator"],
          type: "tag",
        }),
      },
      {
        name: "tag_expression",
        symbols: [
          "TAG",
          "entity",
          { literal: "." },
          "category",
          "tag_operator",
          "_",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["tag_field"],
          type: "tag",
        }),
      },
      {
        name: "tag_expression",
        symbols: [
          "TAG",
          "entity",
          { literal: "." },
          "category",
          "tag_operator",
          "value",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], d[5]]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["tag_field"],
          type: "tag",
        }),
      },
      {
        name: "tag_expression",
        symbols: [
          "TAG",
          "entity",
          { literal: "." },
          "category",
          "tag_operator",
          "value",
          "__",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], d[5], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["expression_operator"],
          type: "tag",
        }),
      },
      {
        name: "tag_expression",
        symbols: [
          "TAG",
          "entity",
          { literal: "." },
          "category",
          "tag_operator",
          "value",
          "__",
          "literals",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], d[5], { value: d[7] }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["expression_operator"],
          type: "tag",
        }),
      },
      {
        name: "count_expression",
        symbols: ["COUNT_OF", "_", "cursor"],
        postprocess: (d) => ({
          results: [],
          next: ["entity"],
          type: "count of",
        }),
      },
      {
        name: "count_expression",
        symbols: ["COUNT_OF", "entity_without_trailing_space", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["entity"],
          type: "count of",
        }),
      },
      {
        name: "count_expression",
        symbols: [
          "COUNT_OF",
          "entity_without_trailing_space",
          { literal: "." },
          "_",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["entity"],
          type: "count of",
        }),
      },
      {
        name: "count_expression",
        symbols: ["COUNT_OF", "entity_without_trailing_space", "__", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["count_operator"],
          type: "count of",
        }),
      },
      {
        name: "count_expression",
        symbols: [
          "COUNT_OF",
          "entity_without_trailing_space",
          "__",
          "literals",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], { type: "operator", value: d[3] }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["count_operator"],
          type: "count of",
        }),
      },
      {
        name: "count_expression",
        symbols: [
          "COUNT_OF",
          "entity_without_trailing_space",
          "count_operator",
          "_",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[2], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["value"],
          type: "count of",
        }),
      },
      {
        name: "count_expression",
        symbols: [
          "COUNT_OF",
          "entity_without_trailing_space",
          "count_operator",
          "value",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[2], d[3], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["entity"],
          type: "count of",
        }),
      },
      {
        name: "count_expression",
        symbols: [
          "COUNT_OF",
          "entity_without_trailing_space",
          "count_operator",
          "value",
          "__",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[2], d[3], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["expression_operator"],
          type: "count of",
        }),
      },
      {
        name: "count_expression",
        symbols: [
          "COUNT_OF",
          "entity_without_trailing_space",
          "count_operator",
          "value",
          "__",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[2], d[3], { value: d[5] }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["expression_operator"],
          type: "count of",
        }),
      },
      {
        name: "find_expression",
        symbols: ["FIND", "_", "cursor"],
        postprocess: (d) => ({ results: [], next: ["entity"], type: "find" }),
      },
      {
        name: "find_expression",
        symbols: ["FIND", "entity", "cursor"],
        postprocess: (d) => ({
          results: [d[1]].flat().map((e) => ({ type: e.type, value: e.value })),
          next: ["entity", "field"],
          type: "find",
        }),
      },
      {
        name: "find_expression",
        symbols: ["FIND", "entity", { literal: "." }, "_", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["entity", "field"],
          type: "find",
        }),
      },
      {
        name: "find_expression",
        symbols: ["FIND", "entity", { literal: "." }, "field", "__", "cursor"],
        postprocess: (d) => ({
          results: [d[1], d[3], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["operator"],
          type: "find",
        }),
      },
      {
        name: "find_expression",
        symbols: [
          "FIND",
          "entity",
          { literal: "." },
          "field",
          "__",
          "literals",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], { type: ["operator"], value: d[5] }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["operator"],
          type: "field",
        }),
      },
      {
        name: "find_expression",
        symbols: [
          "FIND",
          "entity",
          { literal: "." },
          "field",
          "operator",
          "_",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["value"],
          type: "find",
        }),
      },
      {
        name: "find_expression",
        symbols: [
          "FIND",
          "entity",
          { literal: "." },
          "field",
          "operator",
          "value",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], d[5]]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["value"],
          type: "find",
        }),
      },
      {
        name: "find_expression",
        symbols: [
          "FIND",
          "entity",
          { literal: "." },
          "field",
          "operator",
          "value",
          "__",
          "cursor",
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], d[5], { value: "" }]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          next: ["check_operator"],
          type: "find",
        }),
      },
      {
        name: "find_expression",
        symbols: [
          "FIND",
          "entity",
          { literal: "." },
          "field",
          "operator",
          "value",
          "check",
        ],
        postprocess: (d) => ({
          type: "expression",
          results: [d[1], d[3], d[4], d[5], d[6].results]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          type: "find",
          next: d[6].next,
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ALL", "_", "cursor"],
        postprocess: (d) => ({
          results: [{ value: "" }],
          next: ["field"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ALL", "field", "cursor"],
        postprocess: (d) => ({
          results: [d[1]],
          next: ["field"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ALL", "field", "__", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: "" }],
          next: ["operator"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ALL", "field", "__", "literals", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: d[3] }],
          next: ["operator"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ALL", "field", "operator", "_", "cursor"],
        postprocess: (d) => ({
          results: [d[1], d[2], { value: "" }],
          next: ["value"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ALL", "field", "operator", "value", "cursor"],
        postprocess: (d) => ({
          results: [d[1], d[2], d[3], { value: "" }],
          next: ["value"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ALL", "field", "operator", "value", "__", "cursor"],
        postprocess: (d) => ({
          results: [d[1], d[2], d[3], { value: "" }],
          next: ["expression_operator"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ANY", "field", "operator", "value"],
        postprocess: (d) =>
          [d[1], d[2], d[3]]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
      },
      {
        name: "check",
        symbols: ["CHECK_ANY", "_", "cursor"],
        postprocess: (d) => ({
          results: [{ value: "" }],
          next: ["field"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ANY", "field", "cursor"],
        postprocess: (d) => ({
          results: [d[1]],
          next: ["field"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ANY", "field", "__", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: "" }],
          next: ["operator"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ANY", "field", "__", "literals", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: d[3] }],
          next: ["operator"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ANY", "field", "operator", "_", "cursor"],
        postprocess: (d) => ({
          results: [d[1], d[2], { value: "" }],
          next: ["value"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ANY", "field", "operator", "value", "cursor"],
        postprocess: (d) => ({
          results: [d[1], d[2], d[3], { value: "" }],
          next: ["value"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_ANY", "field", "operator", "value", "__", "cursor"],
        postprocess: (d) => ({
          results: [d[1], d[2], d[3], { value: "" }],
          next: ["expression_operator"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_COUNT", "operator", "value"],
        postprocess: (d) =>
          [d[1], d[2]].flat().map((e) => ({ type: e.type, value: e.value })),
      },
      {
        name: "check",
        symbols: ["CHECK_COUNT", "_", "cursor"],
        postprocess: (d) => ({
          results: [{ value: "" }],
          next: ["operator"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_COUNT", "field", "__", "literals", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: d[3] }],
          next: ["operator"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_COUNT", "operator", "_", "cursor"],
        postprocess: (d) => ({
          results: [d[1], { value: "" }],
          next: ["value"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_COUNT", "operator", "value", "cursor"],
        postprocess: (d) => ({
          results: [d[1], d[2], { value: "" }],
          next: ["value"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["CHECK_COUNT", "operator", "value", "__", "cursor"],
        postprocess: (d) => ({
          results: [d[1], d[2], { value: "" }],
          next: ["expression_operator"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["__", "literals", "_", "cursor"],
        postprocess: (d) => ({
          results: [{ value: d[1] }],
          next: ["check_operator"],
          type: "find",
        }),
      },
      {
        name: "check",
        symbols: ["__", "literals", "__", "literals", "cursor"],
        postprocess: (d) => ({
          results: [{ value: d[3] }],
          next: ["check_operator"],
          type: "find",
        }),
      },
      {
        name: "field",
        symbols: ["_", "literals"],
        postprocess: (d) => ({ type: "field", value: d[1] }),
      },
      {
        name: "field",
        symbols: ["_", "text_value"],
        postprocess: (d) => ({ type: "field", value: d[1] }),
      },
      {
        name: "operator",
        symbols: ["_", { literal: "=" }],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "operator$string$1",
        symbols: [
          { literal: "C" },
          { literal: "O" },
          { literal: "N" },
          { literal: "T" },
          { literal: "A" },
          { literal: "I" },
          { literal: "N" },
          { literal: "S" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "operator",
        symbols: ["_", "operator$string$1"],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "operator",
        symbols: ["_", { literal: "<" }],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "operator",
        symbols: ["_", { literal: ">" }],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "operator$string$2",
        symbols: [{ literal: ">" }, { literal: "=" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "operator",
        symbols: ["_", "operator$string$2"],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "operator$string$3",
        symbols: [{ literal: "<" }, { literal: "=" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "operator",
        symbols: ["_", "operator$string$3"],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "operator$string$4",
        symbols: [
          { literal: "I" },
          { literal: "N" },
          { literal: "C" },
          { literal: "L" },
          { literal: "U" },
          { literal: "D" },
          { literal: "E" },
          { literal: "S" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "operator",
        symbols: ["_", "operator$string$4"],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "operator$string$5",
        symbols: [
          { literal: "I" },
          { literal: "S" },
          { literal: " " },
          { literal: "N" },
          { literal: "O" },
          { literal: "T" },
          { literal: " " },
          { literal: "E" },
          { literal: "M" },
          { literal: "P" },
          { literal: "T" },
          { literal: "Y" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "operator",
        symbols: ["_", "operator$string$5"],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "operator$string$6",
        symbols: [{ literal: "I" }, { literal: "S" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "operator",
        symbols: ["_", "operator$string$6"],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "operator$string$7",
        symbols: [
          { literal: "S" },
          { literal: "T" },
          { literal: "A" },
          { literal: "R" },
          { literal: "T" },
          { literal: "S" },
          { literal: " " },
          { literal: "W" },
          { literal: "I" },
          { literal: "T" },
          { literal: "H" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "operator",
        symbols: ["_", "operator$string$7"],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "operator$string$8",
        symbols: [
          { literal: "R" },
          { literal: "E" },
          { literal: "G" },
          { literal: "U" },
          { literal: "L" },
          { literal: "A" },
          { literal: "R" },
          { literal: " " },
          { literal: "E" },
          { literal: "X" },
          { literal: "P" },
          { literal: "R" },
          { literal: "E" },
          { literal: "S" },
          { literal: "S" },
          { literal: "I" },
          { literal: "O" },
          { literal: "N" },
          { literal: " " },
          { literal: "M" },
          { literal: "A" },
          { literal: "T" },
          { literal: "C" },
          { literal: "H" },
          { literal: "E" },
          { literal: "S" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "operator",
        symbols: ["_", "operator$string$8"],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "count_operator",
        symbols: ["_", { literal: "=" }],
        postprocess: (d) => ({ type: "count_operator", value: d[1] }),
      },
      {
        name: "count_operator",
        symbols: ["_", { literal: "<" }],
        postprocess: (d) => ({ type: "count_operator", value: d[1] }),
      },
      {
        name: "count_operator",
        symbols: ["_", { literal: ">" }],
        postprocess: (d) => ({ type: "count_operator", value: d[1] }),
      },
      {
        name: "count_operator$string$1",
        symbols: [{ literal: ">" }, { literal: "=" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "count_operator",
        symbols: ["_", "count_operator$string$1"],
        postprocess: (d) => ({ type: "count_operator", value: d[1] }),
      },
      {
        name: "count_operator$string$2",
        symbols: [{ literal: "<" }, { literal: "=" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "count_operator",
        symbols: ["_", "count_operator$string$2"],
        postprocess: (d) => ({ type: "count_operator", value: d[1] }),
      },
      {
        name: "category",
        symbols: ["_", "literals"],
        postprocess: (d) => ({ type: "category", value: d[1] }),
      },
      {
        name: "category",
        symbols: ["_", "text_value"],
        postprocess: (d) => ({ type: "category", value: d[1] }),
      },
      {
        name: "entity",
        symbols: ["_", "literals", "_"],
        postprocess: (d) => ({
          type: "entity",
          value: d[1],
          next: ["entity", "field", "exp_type"],
        }),
      },
      {
        name: "entity",
        symbols: ["entity", { literal: "." }, "literals"],
        postprocess: (d) =>
          [d[0]].flat().concat([{ type: "entity", value: d[2] }]),
      },
      {
        name: "entity",
        symbols: ["_", "text_value"],
        postprocess: (d) => ({ type: "field", value: d[1] }),
      },
      {
        name: "entity",
        symbols: ["entity", { literal: "." }, "text_value"],
        postprocess: (d) =>
          [d[0]].flat().concat([{ type: "entity", value: d[2] }]),
      },
      {
        name: "entity_without_trailing_space",
        symbols: ["_", "literals"],
        postprocess: (d) => ({ type: "entity", value: d[1] }),
      },
      {
        name: "entity_without_trailing_space",
        symbols: ["entity", { literal: "." }, "literals"],
        postprocess: (d) =>
          [d[0]].flat().concat([{ type: "entity", value: d[2] }]),
      },
      {
        name: "entity_without_trailing_space",
        symbols: ["_", "text_value"],
        postprocess: (d) => ({ type: "field", value: d[1] }),
      },
      {
        name: "entity_without_trailing_space",
        symbols: ["entity", { literal: "." }, "text_value"],
        postprocess: (d) =>
          [d[0]].flat().concat([{ type: "entity", value: d[2] }]),
      },
      {
        name: "value",
        symbols: ["_", "literals"],
        postprocess: (d) => ({ type: "value", value: d[1] }),
      },
      {
        name: "value",
        symbols: ["_", "text_value"],
        postprocess: (d) => ({ type: "value", value: d[1] }),
      },
      {
        name: "text_value",
        symbols: [/[\"]/, "not_quote", /[\"]/],
        postprocess: (d) => d[1],
      },
      {
        name: "text_value",
        symbols: [/[\"]/, "not_quote"],
        postprocess: (d) => d[1],
      },
      { name: "text_value", symbols: [/[\"]/, /[\"]/], postprocess: (d) => "" },
      { name: "text_value", symbols: [/[\"]/], postprocess: (d) => "" },
      { name: "literals", symbols: [/[a-zA-Z0-9]/], postprocess: (d) => d[0] },
      {
        name: "literals",
        symbols: ["literals", /[a-zA-Z0-9]/],
        postprocess: (d) => d[0] + d[1],
      },
      {
        name: "tag_operator",
        symbols: ["_", { literal: "=" }],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "tag_operator$string$1",
        symbols: [
          { literal: "C" },
          { literal: "O" },
          { literal: "N" },
          { literal: "T" },
          { literal: "A" },
          { literal: "I" },
          { literal: "N" },
          { literal: "S" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "tag_operator",
        symbols: ["_", "tag_operator$string$1"],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "tag_operator",
        symbols: ["_", { literal: ":" }],
        postprocess: (d) => ({ type: "operator", value: d[1] }),
      },
      {
        name: "cursor$string$1",
        symbols: [
          { literal: "<" },
          { literal: "<" },
          { literal: "c" },
          { literal: "a" },
          { literal: "r" },
          { literal: "e" },
          { literal: "t" },
          { literal: "_" },
          { literal: "p" },
          { literal: "o" },
          { literal: "s" },
          { literal: "i" },
          { literal: "t" },
          { literal: "i" },
          { literal: "o" },
          { literal: "n" },
          { literal: ">" },
          { literal: ">" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "cursor",
        symbols: ["cursor$string$1", "any"],
        postprocess: (d) => ({ type: "cursor", cursor: d[0], rightText: d[1] }),
      },
      { name: "not_quote", symbols: [/[^"]/], postprocess: (d) => d[0] },
      {
        name: "not_quote",
        symbols: ["not_quote", /[^"]/],
        postprocess: (d) => d[0] + d[1],
      },
      {
        name: "FIELD$subexpression$1$string$1",
        symbols: [
          { literal: "F" },
          { literal: "I" },
          { literal: "E" },
          { literal: "L" },
          { literal: "D" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "FIELD$subexpression$1",
        symbols: ["FIELD$subexpression$1$string$1"],
      },
      {
        name: "FIELD$subexpression$1$string$2",
        symbols: [
          { literal: "F" },
          { literal: "i" },
          { literal: "e" },
          { literal: "l" },
          { literal: "d" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "FIELD$subexpression$1",
        symbols: ["FIELD$subexpression$1$string$2"],
      },
      {
        name: "FIELD",
        symbols: ["_", "FIELD$subexpression$1", "_", { literal: ":" }],
        postprocess: (d) => null,
      },
      {
        name: "TAG$subexpression$1$string$1",
        symbols: [{ literal: "T" }, { literal: "A" }, { literal: "G" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "TAG$subexpression$1",
        symbols: ["TAG$subexpression$1$string$1"],
      },
      {
        name: "TAG$subexpression$1$string$2",
        symbols: [{ literal: "T" }, { literal: "a" }, { literal: "g" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "TAG$subexpression$1",
        symbols: ["TAG$subexpression$1$string$2"],
      },
      {
        name: "TAG",
        symbols: ["_", "TAG$subexpression$1", "_", { literal: ":" }],
        postprocess: (d) => null,
      },
      {
        name: "COUNT_OF$subexpression$1$string$1",
        symbols: [
          { literal: "C" },
          { literal: "O" },
          { literal: "U" },
          { literal: "N" },
          { literal: "T" },
          { literal: " " },
          { literal: "O" },
          { literal: "F" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "COUNT_OF$subexpression$1",
        symbols: ["COUNT_OF$subexpression$1$string$1"],
      },
      {
        name: "COUNT_OF$subexpression$1$string$2",
        symbols: [
          { literal: "C" },
          { literal: "o" },
          { literal: "u" },
          { literal: "n" },
          { literal: "t" },
          { literal: " " },
          { literal: "o" },
          { literal: "f" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "COUNT_OF$subexpression$1",
        symbols: ["COUNT_OF$subexpression$1$string$2"],
      },
      {
        name: "COUNT_OF",
        symbols: ["_", "COUNT_OF$subexpression$1", "_", { literal: ":" }],
        postprocess: (d) => null,
      },
      {
        name: "FIND$subexpression$1$string$1",
        symbols: [
          { literal: "F" },
          { literal: "I" },
          { literal: "N" },
          { literal: "D" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "FIND$subexpression$1",
        symbols: ["FIND$subexpression$1$string$1"],
      },
      {
        name: "FIND$subexpression$1$string$2",
        symbols: [
          { literal: "F" },
          { literal: "i" },
          { literal: "n" },
          { literal: "d" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "FIND$subexpression$1",
        symbols: ["FIND$subexpression$1$string$2"],
      },
      {
        name: "FIND",
        symbols: ["_", "FIND$subexpression$1", "_", { literal: ":" }],
        postprocess: (d) => null,
      },
      {
        name: "REGKEY$subexpression$1$string$1",
        symbols: [
          { literal: "R" },
          { literal: "E" },
          { literal: "G" },
          { literal: "K" },
          { literal: "E" },
          { literal: "Y" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "REGKEY$subexpression$1",
        symbols: ["REGKEY$subexpression$1$string$1"],
      },
      {
        name: "REGKEY$subexpression$1$string$2",
        symbols: [
          { literal: "R" },
          { literal: "e" },
          { literal: "g" },
          { literal: "k" },
          { literal: "e" },
          { literal: "y" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "REGKEY$subexpression$1",
        symbols: ["REGKEY$subexpression$1$string$2"],
      },
      {
        name: "REGKEY",
        symbols: ["_", "REGKEY$subexpression$1", "_", { literal: ":" }],
        postprocess: (d) => null,
      },
      {
        name: "CHECK_ALL$subexpression$1$string$1",
        symbols: [
          { literal: "C" },
          { literal: "H" },
          { literal: "E" },
          { literal: "C" },
          { literal: "K" },
          { literal: " " },
          { literal: "A" },
          { literal: "L" },
          { literal: "L" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "CHECK_ALL$subexpression$1",
        symbols: ["CHECK_ALL$subexpression$1$string$1"],
      },
      {
        name: "CHECK_ALL$subexpression$1$string$2",
        symbols: [
          { literal: "C" },
          { literal: "h" },
          { literal: "e" },
          { literal: "c" },
          { literal: "k" },
          { literal: " " },
          { literal: "a" },
          { literal: "l" },
          { literal: "l" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "CHECK_ALL$subexpression$1",
        symbols: ["CHECK_ALL$subexpression$1$string$2"],
      },
      {
        name: "CHECK_ALL",
        symbols: ["_", "CHECK_ALL$subexpression$1", "_", { literal: ":" }],
        postprocess: (d) => null,
      },
      {
        name: "CHECK_ANY$subexpression$1$string$1",
        symbols: [
          { literal: "C" },
          { literal: "H" },
          { literal: "E" },
          { literal: "C" },
          { literal: "K" },
          { literal: " " },
          { literal: "A" },
          { literal: "N" },
          { literal: "Y" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "CHECK_ANY$subexpression$1",
        symbols: ["CHECK_ANY$subexpression$1$string$1"],
      },
      {
        name: "CHECK_ANY$subexpression$1$string$2",
        symbols: [
          { literal: "C" },
          { literal: "h" },
          { literal: "e" },
          { literal: "c" },
          { literal: "k" },
          { literal: " " },
          { literal: "a" },
          { literal: "n" },
          { literal: "y" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "CHECK_ANY$subexpression$1",
        symbols: ["CHECK_ANY$subexpression$1$string$2"],
      },
      {
        name: "CHECK_ANY",
        symbols: ["_", "CHECK_ANY$subexpression$1", "_", { literal: ":" }],
        postprocess: (d) => null,
      },
      {
        name: "CHECK_COUNT$subexpression$1$string$1",
        symbols: [
          { literal: "C" },
          { literal: "H" },
          { literal: "E" },
          { literal: "C" },
          { literal: "K" },
          { literal: " " },
          { literal: "C" },
          { literal: "O" },
          { literal: "U" },
          { literal: "N" },
          { literal: "T" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "CHECK_COUNT$subexpression$1",
        symbols: ["CHECK_COUNT$subexpression$1$string$1"],
      },
      {
        name: "CHECK_COUNT$subexpression$1$string$2",
        symbols: [
          { literal: "C" },
          { literal: "h" },
          { literal: "e" },
          { literal: "c" },
          { literal: "k" },
          { literal: " " },
          { literal: "c" },
          { literal: "o" },
          { literal: "u" },
          { literal: "n" },
          { literal: "t" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "CHECK_COUNT$subexpression$1",
        symbols: ["CHECK_COUNT$subexpression$1$string$2"],
      },
      {
        name: "CHECK_COUNT",
        symbols: ["_", "CHECK_COUNT$subexpression$1", "_", { literal: ":" }],
        postprocess: (d) => null,
      },
      { name: "_$ebnf$1", symbols: [] },
      {
        name: "_$ebnf$1",
        symbols: ["_$ebnf$1", /[\s]/],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      { name: "_", symbols: ["_$ebnf$1"], postprocess: (d) => null },
      { name: "__$ebnf$1", symbols: [/[\s]/] },
      {
        name: "__$ebnf$1",
        symbols: ["__$ebnf$1", /[\s]/],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      { name: "__", symbols: ["__$ebnf$1"], postprocess: (d) => null },
      { name: "any$ebnf$1", symbols: [] },
      {
        name: "any$ebnf$1",
        symbols: ["any$ebnf$1", /./],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      { name: "any", symbols: ["any$ebnf$1"] },
    ],
    ParserStart: "Main",
  };
  if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = grammar;
  } else {
    window.grammar = grammar;
  }
})();
