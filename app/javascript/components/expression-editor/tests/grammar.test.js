const nearley = require("nearley");
const partialGrammar = require("../grammar.ne.js");

describe("field expression", () => {
  let parser;
  beforeEach(() => {
    parser = new nearley.Parser(nearley.Grammar.fromCompiled(partialGrammar));
  });

  it("blank", () => {
    const input = "<<caret_position>>";
    const expectedOutput = {
      results: [],
      next: ["entity", "exp_type"],
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("start typing", () => {
    const input = "v<<caret_position>>";
    const expectedOutput = {
      results: [{ type: "entity", value: "v" }],
      next: ["entity", "field", "exp_type"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("dont care about anything after caret", () => {
    const input =
      "vm<<caret_position>>kjdfkjnfdkjfkjfdkjfdkj fdkjfdfdfdkjkjfdkj";
    const expectedOutput = {
      results: [{ type: "entity", value: "vm" }],
      next: ["entity", "field", "exp_type"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("vm", () => {
    const input = "vm<<caret_position>>";
    const expectedOutput = {
      results: [{ type: "entity", value: "vm" }],
      next: ["entity", "field", "exp_type"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("vm.", () => {
    const input = "vm.<<caret_position>>";
    const expectedOutput = {
      results: [{ type: "entity", value: "vm" }, { value: "" }],
      next: ["entity", "field"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("vm.na", () => {
    const input = "vm.na<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "na" },
      ],
      next: ["entity", "field"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("vm.name_", () => {
    const input = "vm.name <<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "field", value: "name" },
        { value: "" },
      ],
      next: ["operator"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("vm.name CON", () => {
    const input = "vm.name CON<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "field", value: "name" },
        { type: "operator", value: "CON" },
      ],
      next: ["operator"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("vm.name CONTAINS_", () => {
    const input = "vm.name CONTAINS <<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "field", value: "name" },
        { type: "operator", value: "CONTAINS" },
        { value: "" },
      ],
      next: ["value"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('vm.name CONTAINS "svickova s knedlikem"', () => {
    const input = 'vm.name CONTAINS "svickova s knedlikem"<<caret_position>>';
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "field", value: "name" },
        { type: "operator", value: "CONTAINS" },
        { type: "value", value: "svickova s knedlikem" },
      ],
      next: ["value"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIELD:", () => {
    const input = "FIELD:<<caret_position>>";
    const expectedOutput = {
      results: [],
      next: ["entity"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIELD:vm", () => {
    const input = "FIELD:vm<<caret_position>>";
    const expectedOutput = {
      results: [{ type: "entity", value: "vm" }],
      next: ["entity", "field"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIELD: vm.", () => {
    const input = "FIELD: vm.<<caret_position>>";
    const expectedOutput = {
      results: [{ type: "entity", value: "vm" }, { value: "" }],
      next: ["entity", "field"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIELD: vm.na", () => {
    const input = "FIELD: vm.na<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "na" },
      ],
      next: ["entity", "field"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIELD: vm.name_", () => {
    const input = "FIELD: vm.name <<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "field", value: "name" },
        { value: "" },
      ],
      next: ["operator"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIELD: vm.name CON", () => {
    const input = "FIELD: vm.name CON<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "field", value: "name" },
        { type: "operator", value: "CON" },
      ],
      next: ["operator"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIELD: vm.name CONTAINS_", () => {
    const input = "FIELD: vm.name CONTAINS <<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "field", value: "name" },
        { type: "operator", value: "CONTAINS" },
        { value: "" },
      ],
      next: ["value"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('FIELD: vm.name CONTAINS "svickova s knedlikem"', () => {
    const input =
      'FIELD: vm.name CONTAINS "svickova s knedlikem"<<caret_position>>';
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "field", value: "name" },
        { type: "operator", value: "CONTAINS" },
        { type: "value", value: "svickova s knedlikem" },
      ],
      next: ["value"],
      type: "field",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });
});

describe("tags expression", () => {
  let parser;
  beforeEach(() => {
    parser = new nearley.Parser(nearley.Grammar.fromCompiled(partialGrammar));
  });

  it("TAGS:", () => {
    const input = "TAGS:<<caret_position>>";
    const expectedOutput = {
      results: [],
      next: ["entity"],
      type: "tag",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('TAGS: "Virtu', () => {
    const input = 'TAGS: "Virtu<<caret_position>>';
    const expectedOutput = {
      results: [{ type: "field", value: "Virtu" }],
      next: ["entity", "category"],
      type: "tag",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('TAGS: "Virtual_', () => {
    const input = 'TAGS: "Virtual <<caret_position>>';
    const expectedOutput = {
      results: [{ type: "field", value: "Virtual " }],
      next: ["entity", "category"],
      type: "tag",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('TAGS: "Virtual Machine"', () => {
    const input = 'TAGS: "Virtual Machine"<<caret_position>>';
    const expectedOutput = {
      results: [{ type: "field", value: "Virtual Machine" }],
      next: ["entity", "category"],
      type: "tag",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('TAGS: "Virtual Machine".', () => {
    const input = 'TAGS: "Virtual Machine".<<caret_position>>';
    const expectedOutput = {
      results: [{ type: "field", value: "Virtual Machine" }, { value: "" }],
      next: ["entity", "category"],
      type: "tag",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('TAGS: "Virtual Machine".Environment', () => {
    const input = 'TAGS: "Virtual Machine".Environment<<caret_position>>';
    const expectedOutput = {
      results: [
        { type: "field", value: "Virtual Machine" },
        { type: "entity", value: "Environment" },
      ],
      next: ["entity", "category"],
      type: "tag",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('TAGS: "Virtual Machine".Environment:', () => {
    const input = 'TAGS: "Virtual Machine".Environment:<<caret_position>>';
    const expectedOutput = {
      results: [
        { type: "field", value: "Virtual Machine" },
        { type: "category", value: "Environment" },
        { type: "operator", value: ":" },
        { value: "" },
      ],
      next: ["value"],
      type: "tag",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('TAGS: "Virtual Machine".Environment:_', () => {
    const input = 'TAGS: "Virtual Machine".Environment: <<caret_position>>';
    const expectedOutput = {
      results: [
        { type: "field", value: "Virtual Machine" },
        { type: "category", value: "Environment" },
        { type: "operator", value: ":" },
        { value: "" },
      ],
      next: ["value"],
      type: "tag",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('TAGS: "Virtual Machine".Environment: CONTAINS_', () => {
    const input =
      'TAGS: "Virtual Machine".Environment CONTAINS <<caret_position>>';
    const expectedOutput = {
      results: [
        { type: "field", value: "Virtual Machine" },
        { type: "category", value: "Environment" },
        { type: "operator", value: "CONTAINS" },
        { value: "" },
      ],
      next: ["value"],
      type: "tag",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('TAGS: "Virtual Machine".Environment: CONTAINS Developement', () => {
    const input =
      'TAGS: "Virtual Machine".Environment CONTAINS Developement<<caret_position>>';
    const expectedOutput = {
      results: [
        { type: "field", value: "Virtual Machine" },
        { type: "category", value: "Environment" },
        { type: "operator", value: "CONTAINS" },
        { type: "value", value: "Developement" },
      ],
      next: ["value"],
      type: "tag",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });
});

describe("count of expression", () => {
  let parser;
  beforeEach(() => {
    parser = new nearley.Parser(nearley.Grammar.fromCompiled(partialGrammar));
  });

  it("COUNT OF: ", () => {
    const input = "COUNT OF:<<caret_position>>";
    const expectedOutput = {
      results: [],
      next: ["entity"],
      type: "count of",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("COUNT OF: vm", () => {
    const input = "COUNT OF: vm<<caret_position>>";
    const expectedOutput = {
      results: [{ type: "entity", value: "vm" }, { value: "" }],
      next: ["entity"],
      type: "count of",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("COUNT OF: vm >", () => {
    const input = "COUNT OF: vm ><<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "count_operator", value: ">" },
        { type: undefined, value: "" },
      ],
      next: ["value"],
      type: "count of",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("COUNT OF: vm > 10", () => {
    const input = "COUNT OF: vm > 10<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "count_operator", value: ">" },
        { type: "value", value: "10" },
        { type: undefined, value: "" },
      ],
      next: ["entity"],
      type: "count of",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("COUNT OF: vm > 10_", () => {
    const input = "COUNT OF: vm > 10 <<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "count_operator", value: ">" },
        { type: "value", value: "10" },
        { type: undefined, value: "" },
      ],
      next: ["expression_operator"],
      type: "count of",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });
});

describe("find expression", () => {
  let parser;
  beforeEach(() => {
    parser = new nearley.Parser(nearley.Grammar.fromCompiled(partialGrammar));
  });

  it("FIND:", () => {
    const input = "FIND:<<caret_position>>";
    const expectedOutput = {
      results: [],
      next: ["entity"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm", () => {
    const input = "FIND: vm<<caret_position>>";
    const expectedOutput = {
      results: [{ type: "entity", value: "vm" }],
      next: ["entity", "field"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm.settings", () => {
    const input = "FIND: vm.settings<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
      ],
      next: ["entity", "field"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm.settings.owner_", () => {
    const input = "FIND: vm.settings.owner <<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
        { type: "field", value: "owner" },
        { value: "" },
      ],
      next: ["operator"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm.settings.owner INCLUDES", () => {
    const input = "FIND: vm.settings.owner INCLUDES<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
        { type: "field", value: "owner" },
        { type: "operator", value: "INCLUDES" },
        { value: "" },
      ],
      next: ["value"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm.settings.owner INCLUDES admin", () => {
    const input = "FIND: vm.settings.owner INCLUDES admin<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
        { type: "field", value: "owner" },
        { type: "operator", value: "INCLUDES" },
        { type: "value", value: "admin" },
      ],
      next: ["value"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm.settings.owner INCLUDES admin_", () => {
    const input = "FIND: vm.settings.owner INCLUDES admin <<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
        { type: "field", value: "owner" },
        { type: "operator", value: "INCLUDES" },
        { type: "value", value: "admin" },
        { type: undefined, value: "" },
      ],
      next: ["check_operator"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm.settings.owner INCLUDES admin CHECK", () => {
    const input =
      "FIND: vm.settings.owner INCLUDES admin CHECK<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
        { type: "field", value: "owner" },
        { type: "operator", value: "INCLUDES" },
        { type: "value", value: "admin" },
        { type: undefined, value: "CHECK" },
      ],
      next: ["check_operator"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm.settings.owner INCLUDES admin CHECK_", () => {
    const input =
      "FIND: vm.settings.owner INCLUDES admin CHECK <<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
        { type: "field", value: "owner" },
        { type: "operator", value: "INCLUDES" },
        { type: "value", value: "admin" },
        { type: undefined, value: "CHECK" },
      ],
      next: ["check_operator"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm.settings.owner INCLUDES admin CHECK ALL:", () => {
    const input =
      "FIND: vm.settings.owner INCLUDES admin CHECK ALL:<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
        { type: "field", value: "owner" },
        { type: "operator", value: "INCLUDES" },
        { type: "value", value: "admin" },
        { value: "" },
      ],
      next: ["field"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm.settings.owner INCLUDES admin CHECK ALL: date", () => {
    const input =
      "FIND: vm.settings.owner INCLUDES admin CHECK ALL: date<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
        { type: "field", value: "owner" },
        { type: "operator", value: "INCLUDES" },
        { type: "value", value: "admin" },
        { type: "field", value: "date" },
      ],
      next: ["field"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it("FIND: vm.settings.owner INCLUDES admin CHECK ALL: date =", () => {
    const input =
      "FIND: vm.settings.owner INCLUDES admin CHECK ALL: date =<<caret_position>>";
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
        { type: "field", value: "owner" },
        { type: "operator", value: "INCLUDES" },
        { type: "value", value: "admin" },
        { type: "field", value: "date" },
        { type: "operator", value: "=" },
        { value: "" },
      ],
      next: ["value"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });

  it('FIND: vm.settings.owner INCLUDES admin CHECK ALL: date = "10.9.2018"', () => {
    const input =
      'FIND: vm.settings.owner INCLUDES admin CHECK ALL: date = "10.9.2018"<<caret_position>>';
    const expectedOutput = {
      results: [
        { type: "entity", value: "vm" },
        { type: "entity", value: "settings" },
        { type: "field", value: "owner" },
        { type: "operator", value: "INCLUDES" },
        { type: "value", value: "admin" },
        { type: "field", value: "date" },
        { type: "operator", value: "=" },
        { type: "value", value: "10.9.2018" },
        { value: "" },
      ],
      next: ["value"],
      type: "find",
    };
    parser.feed(input);
    expect(parser.results[0][0]).toEqual(expectedOutput);
  });
});
