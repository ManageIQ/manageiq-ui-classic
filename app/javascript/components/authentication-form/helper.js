export const getTimeOptions = (numOptions, multiplier) => {
  const options = [];
  const temp = [...Array(numOptions).keys()];
  temp.forEach((timeOption) => {
    options.push({ value: (timeOption * multiplier).toString(), label: (timeOption * multiplier).toString() });
  });
  return options;
};

export const secretKeyPlaceholder = () => {
  let placeholder = '';
  const length = [...Array(8).keys()];
  length.forEach(() => {
    placeholder += '\u25cf';
  });
  return placeholder;
};
