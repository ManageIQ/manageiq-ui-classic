export const trimInput = (input, caretPosition) => {
  let currentExp = input.slice(0, caretPosition) + "<<caret_position>>";
  const leftIndex = Math.max(
    currentExp.lastIndexOf("AND"),
    currentExp.lastIndexOf("OR"),
    0
  );
  // const rightIndex = [inputText.indexOf('AND', caretPosition-3), inputText.indexOf('OR', caretPosition-2)].reduce((a,b) => b > 0 ? (a < b ? a : b) : a, inputText.length-1);
  return currentExp.slice(leftIndex).replace(/AND|OR/, "");
};

export const replaceToken = (input, caretPosition) => {
  const leftIndex = Math.max(
    currentExp.lastIndexOf("AND"),
    currentExp.lastIndexOf("OR"),
    0
  );
  const arr = [];
  arr.reduce(
    (acc, i) => (i[0] <= caretPosition && i[1] >= caretPosition ? i[1] : acc),
    0
  );
};

const ast = (value) => ({
  toString: () =>
    value
      .map((x) => (x.type === "entity" ? x.value + "." : x.value + " "))
      .reduce((acc, i) => acc + i, ""),
  positionTokenIndex: (index) =>
    value.reduce(
      (acc, i) =>
        acc.length + i.value.length < index
          ? { index: acc.index + 1, length: acc.length + i.value.length }
          : acc,
      { length: 0, index: -1 }
    ).index,
  value,
  last: value.slice(-1)[0],
});
