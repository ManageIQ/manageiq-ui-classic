export const getYAxisValue = (format, value) => {
  if (value === null || value === undefined) {
    return value;
  }
  if (format && ManageIQ?.charts?.formatters?.[format.function]?.c3) {
    try {
      const formatted = ManageIQ.charts.formatters[format.function].c3(format.options)(value);
      if (formatted !== null && formatted !== undefined) {
        // eslint-disable-next-line no-useless-escape
        const tmp = /^([0-9\,\.]+)(.*)/.exec(String(formatted));
        if (tmp) {
          return `${numeral(tmp[1]).value()}${tmp[2]}`;
        }
        return String(formatted);
      }
    } catch (_e) {
      return value;
    }
  }
  return value;
};
