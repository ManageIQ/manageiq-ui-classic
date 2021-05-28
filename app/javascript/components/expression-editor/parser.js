import grammar from "./grammar.jison.js";
import { Parser } from "jison-gho";
const nearley = require("nearley");
const partialGrammar = require("./grammar.ne.js");

export const parser = new Parser(grammar);
export let partialParser = new nearley.Parser(
  nearley.Grammar.fromCompiled(partialGrammar)
);

// partialParser.feed("vm.name = ahoj");

// console.log(partialParser.results);
