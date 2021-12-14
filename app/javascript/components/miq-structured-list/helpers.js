/* eslint-disable no-eval */

const dataType = (data) => (data ? data.constructor.name.toString() : undefined);

export const isObject = (item) => dataType(item) === 'Object';

export const isArray = (item) => dataType(item) === 'Array';

export const isSubItem = (item) => item.sub_items && item.sub_items.length > 0;

/** When the props named mode includes 'miq_summary', then then summary contains row/cell click events. */
export const hasClickEvents = (mode) => mode.includes('miq_summary');

export const rowClickEvent = (rows, index) => {
  const item = rows[index];
  if (item && item.onclick) {
    miqSparkleOn();
    eval(item.onclick);
    miqSparkleOff();
  }
};
