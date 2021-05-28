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
      {
        name: "E",
        symbols: ["_", "disjunction", "_"],
        postprocess: (d) => d[1],
      },
      {
        name: "disjunction$string$1",
        symbols: [{ literal: "O" }, { literal: "R" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "disjunction",
        symbols: [
          "disjunction",
          "_",
          "disjunction$string$1",
          "_",
          "conjunction",
        ],
        postprocess: (d) => ({ left: d[0], right: d[4], operator: "OR" }),
      },
      {
        name: "disjunction",
        symbols: ["conjunction"],
        postprocess: (d) => d[0],
      },
      {
        name: "conjunction$string$1",
        symbols: [{ literal: "A" }, { literal: "N" }, { literal: "D" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "conjunction",
        symbols: [
          "conjunction",
          "_",
          "conjunction$string$1",
          "_",
          "simple_expression",
        ],
        postprocess: (d) => ({ left: d[0], right: d[4], operator: "AND" }),
      },
      {
        name: "conjunction",
        symbols: ["simple_expression"],
        postprocess: (d) => d[0],
      },
      {
        name: "simple_expression",
        symbols: ["field_expression"],
        postprocess: (d) => d[0],
      },
      {
        name: "simple_expression",
        symbols: ["tag_expression"],
        postprocess: (d) => d[0],
      },
      {
        name: "simple_expression",
        symbols: ["count_expression"],
        postprocess: (d) => d[0],
      },
      {
        name: "simple_expression",
        symbols: ["find_expression"],
        postprocess: (d) => d[0],
      },
      {
        name: "simple_expression",
        symbols: [{ literal: "(" }, "disjunction", { literal: ")" }],
        postprocess: (d) => d[1],
      },
      {
        name: "field_expression",
        symbols: ["entity", { literal: "." }, "field", "operator", "value"],
        postprocess: (d) => ({
          value: [d[0], d[2], d[3], d[4]]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
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
        ],
        postprocess: (d) => ({
          value: [d[1], d[3], d[4], d[5]]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          type: "field",
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
        ],
        postprocess: (d) => ({
          results: [d[1], d[3], d[4], d[5]]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          type: "tag",
        }),
      },
      {
        name: "count_expression",
        symbols: ["COUNT_OF", "entity", "operator", "value"],
        postprocess: (d) => ({
          results: [d[1], d[2], d[3]]
            .flat()
            .map((e) => ({ type: e.type, value: e.value })),
          type: "count of",
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
        name: "entity",
        symbols: ["literals"],
        postprocess: (d) => ({ type: "entity", value: d[0] }),
      },
      {
        name: "entity",
        symbols: ["entity", { literal: "." }, "literals"],
        postprocess: (d) =>
          [d[0]].flat().concat([{ type: "entity", value: d[2] }]),
      },
      {
        name: "entity",
        symbols: ["text_value"],
        postprocess: (d) => ({ type: "field", value: d[0] }),
      },
      {
        name: "entity",
        symbols: ["entity", { literal: "." }, "text_value"],
        postprocess: (d) =>
          [d[0]].flat().concat([{ type: "entity", value: d[2] }]),
      },
      {
        name: "field",
        symbols: ["literals"],
        postprocess: (d) => ({ type: "field", value: d[0] }),
      },
      {
        name: "field",
        symbols: ["text_value"],
        postprocess: (d) => ({ type: "field", value: d[0] }),
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
        name: "check",
        symbols: ["CHECK_ALL", "field", "operator", "value"],
        postprocess: (d) => ({ results: [d[1], d[2], d[3]], type: "find" }),
      },
      {
        name: "check",
        symbols: ["CHECK_ANY", "field", "operator", "value"],
        postprocess: (d) => ({ results: [d[1], d[2], d[3]], type: "find" }),
      },
      {
        name: "check",
        symbols: ["CHECK_COUNT", "operator", "value"],
        postprocess: (d) => ({ results: [d[1], d[2]], type: "find" }),
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
        symbols: ["_", "FIELD$subexpression$1", "_", { literal: ":" }, "_"],
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
        symbols: ["_", "TAG$subexpression$1", "_", { literal: ":" }, "_"],
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
        symbols: ["_", "COUNT_OF$subexpression$1", "_", { literal: ":" }, "_"],
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
        symbols: ["_", "FIND$subexpression$1", "_", { literal: ":" }, "_"],
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
        symbols: ["_", "REGKEY$subexpression$1", "_", { literal: ":" }, "_"],
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
        symbols: ["_", "CHECK_ALL$subexpression$1", "_", { literal: ":" }, "_"],
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
        symbols: ["_", "CHECK_ANY$subexpression$1", "_", { literal: ":" }, "_"],
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
        symbols: [
          "_",
          "CHECK_COUNT$subexpression$1",
          "_",
          { literal: ":" },
          "_",
        ],
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
