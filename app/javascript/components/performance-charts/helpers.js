export const getYAxisValue = (format, value) => {
  if (format) {
    // eslint-disable-next-line no-useless-escape
    const match = /^([0-9\,\.]+)(.*)/.exec(String(ManageIQ.charts.formatters[format.function].c3(format.options)(value)));
    if (match) {
      return `${numeral(match[1]).value()}${match[2]}`;
    }
  }
  return value;
};

export const getTickFormatter = (format) => (n) => getYAxisValue(format, n);

export const getTooltipOptions = (format) => ({
  truncation: {
    type: 'none',
  },
  valueFormatter(value, label) {
    if (value instanceof Date || label === 'x-value') {
      return value instanceof Date
        ? value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : value;
    }
    if (label === 'Group') {
      return value;
    }
    return getYAxisValue(format, value);
  },
});
