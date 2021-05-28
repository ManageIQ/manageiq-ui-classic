import { trimInput } from "../helper";

let input;
describe("trim to caret: vm.name = knedlik, caret", () => {
  beforeAll(() => {
    input = "vm.name = knedlik";
  });

  it("position 5", () => {
    const expectedOutput = "vm.na<<caret_position>>";
    expect(trimInput(input, 5)).toEqual(expectedOutput);
  });

  it("position 10", () => {
    const expectedOutput = "vm.name = <<caret_position>>";
    expect(trimInput(input, 10)).toEqual(expectedOutput);
  });

  it("position 15", () => {
    const expectedOutput = "vm.name = knedl<<caret_position>>";
    expect(trimInput(input, 15)).toEqual(expectedOutput);
  });

  it("position 30", () => {
    const expectedOutput = "vm.name = knedlik<<caret_position>>";
    expect(trimInput(input, 30)).toEqual(expectedOutput);
  });
});

describe('trim to caret: "Virtual Machine"."Date Created" = "10.5.2018"', () => {
  beforeAll(() => {
    input = '"Virtual Machine"."Date Created" = "10.5.2018"';
  });

  it("position 5", () => {
    const expectedOutput = '"Virt<<caret_position>>';
    expect(trimInput(input, 5)).toEqual(expectedOutput);
  });

  it("position 10", () => {
    const expectedOutput = '"Virtual M<<caret_position>>';
    expect(trimInput(input, 10)).toEqual(expectedOutput);
  });

  it("position 15", () => {
    const expectedOutput = '"Virtual Machin<<caret_position>>';
    expect(trimInput(input, 15)).toEqual(expectedOutput);
  });

  it("position 20", () => {
    const expectedOutput = '"Virtual Machine"."D<<caret_position>>';
    expect(trimInput(input, 20)).toEqual(expectedOutput);
  });

  it("position 30 ", () => {
    const expectedOutput = '"Virtual Machine"."Date Create<<caret_position>>';
    expect(trimInput(input, 30)).toEqual(expectedOutput);
  });

  it("position 40 ", () => {
    const expectedOutput =
      '"Virtual Machine"."Date Created" = "10.5<<caret_position>>';
    expect(trimInput(input, 40)).toEqual(expectedOutput);
  });

  it("position input.lenght ", () => {
    const expectedOutput =
      '"Virtual Machine"."Date Created" = "10.5.2018"<<caret_position>>';
    expect(trimInput(input, input.length)).toEqual(expectedOutput);
  });
});

describe("trim to caret: vm.name = knedlik OR vm.status = active AND vm.parent INCLUDES bla", () => {
  beforeAll(() => {
    input =
      "vm.name = knedlik OR vm.status = active AND vm.parent INCLUDES bla";
  });

  it("position 5 ", () => {
    const expectedOutput = "vm.na<<caret_position>>";
    expect(trimInput(input, 5)).toEqual(expectedOutput);
  });

  it("position 19 ", () => {
    const expectedOutput = "vm.name = knedlik O<<caret_position>>";
    expect(trimInput(input, 19)).toEqual(expectedOutput);
  });

  it("position 20 ", () => {
    const expectedOutput = "<<caret_position>>";
    expect(trimInput(input, 20)).toEqual(expectedOutput);
  });

  it("position 21 ", () => {
    const expectedOutput = " <<caret_position>>";
    expect(trimInput(input, 21)).toEqual(expectedOutput);
  });

  it("position 22 ", () => {
    const expectedOutput = " v<<caret_position>>";
    expect(trimInput(input, 22)).toEqual(expectedOutput);
  });

  it("position 30 ", () => {
    const expectedOutput = " vm.status<<caret_position>>";
    expect(trimInput(input, 30)).toEqual(expectedOutput);
  });

  it("position 66 ", () => {
    const expectedOutput = " vm.parent INCLUDES bla<<caret_position>>";
    expect(trimInput(input, 66)).toEqual(expectedOutput);
  });
});
