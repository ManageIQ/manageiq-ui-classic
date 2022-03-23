export const getYAxisValue = (format, value) => {
  // eslint-disable-next-line no-useless-escape
  if (format) {
    const tmp = /^([0-9\,\.]+)(.*)/.exec(ManageIQ.charts.formatters[format.function].c3(format.options)(value));
    return [`${numeral(tmp[1]).value()}${tmp[2]}`];
  }
  return value;
};
