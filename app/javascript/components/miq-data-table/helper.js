/** Element types that appeares in a cell. */
export const CellElements = {
  button: 'is_button',
  checkbox: 'is_checkbox',
  icon: 'icon',
  image: 'image',
  text: 'text',
};

/** Click events in a cell.  */
export const CellAction = {
  selectAll: 'selectAll',
  itemSelect: 'itemSelect',
  itemClick: 'itemClick',
};

/** Sorting directions for a table header. */
export const SortDirections = {
  ASC: 'ASC',
  DESC: 'DESC',
  NONE: 'NONE',
};

/** Sorting directions for a Report-data-table header. */
export const ReportSortDirections = {
  ASC: 'asc',
  DESC: 'desc',
  DEFAULT: '',
};

export const DefaultKey = 'defaultKey';
export const isObject = (data) => typeof (data) === 'object';
export const isNull = (data) => (data === null);
export const hasImage = (keys, data) => keys.includes(CellElements.image) && data.image && data.image.trim().length > 0;
export const hasButton = (keys) => keys.includes(CellElements.button);
export const hasText = (data) => Object.keys(data).includes(CellElements.text);
const hasValue = (data) => Object.keys(data).includes('value');

/* Function to determin if only the icon needs to be printed, else, print its text along with the icon. */
export const hasIcon = (keys, data) => {
  if (keys.includes('type') && data.type === 'i') {
    return { showIcon: true, showText: false };
  }
  return {
    showIcon: keys.includes(CellElements.icon) && data.icon && data.icon.length > 0,
    showText: hasText(data),
  };
};

/** Function to extract 'text' from cell value. Objects without 'text' are printed with blank values. */
const getTextValue = (cellValue) => {
  if (isNull(cellValue)) {
    return '';
  }
  if (isObject(cellValue)) {
    if (hasText(cellValue)) {
      return isNull(cellValue.text) ? '' : cellValue.text;
    }
    if (hasValue(cellValue)) {
      return isNull(cellValue.value) ? '' : cellValue.value;
    }
    return '';
  }
  return cellValue;
};

/* For the sorting feature to work, the object in cell.value must be converted to a string.
  Object in cell.value is moved to a new attribute named cell.data to be used in MiqTableCell component. */
export const sortableRows = (dtRows) => dtRows.map((row) => {
  row.cells.map((cell) => {
    if (!cell.data) {
      cell.data = cell.value;
    }
    cell.value = getTextValue(cell.value).toString();
    return cell;
  });
  return row;
});

/** Function to generate the header items and its keys from 'columns'.
 * First item from header is removed if the data table has a checkbox mentioned in 'hasCheckbox'. */
export const headerData = (columns, hasCheckbox) => {
  const header = [];
  columns.forEach((item, columnKey) => {
    const obj = {};
    const text = item.header_text ? item.header_text : `${DefaultKey}_${columnKey}`;
    obj.key = text;
    obj.header = text;
    obj.col_idx = item.col_idx;
    header.push(obj);
  });
  if (hasCheckbox) {
    header.shift();
  }
  return { headerItems: header, headerKeys: header.map((h) => h.key) };
};

/** Function to merge icon only cell with the next cells */
const mergeIcons = (cells) => {
  let merged = false;
  const { showIcon, showText } = hasIcon(Object.keys(cells[0]), cells[0]);
  if (showIcon && !showText) {
    merged = true;
    cells[1] = { ...cells[1], icon: cells[0].icon, image: cells[0].image };
  }
  return { mergedCells: cells, merged };
};

/** Function to generate the row items from 'rows' using the 'headerKeys'.
 * The checkbox object is filtered out from the cell object if the data table contains a checkbox. */
export const rowData = (headerKeys, rows, hasCheckbox) => {
  const rowItems = [];
  const mergedStatus = [];
  rows.forEach(({
    cells, id, clickable, clickId,
  }) => {
    const requiredCells = hasCheckbox ? (cells.filter((c) => !c.is_checkbox)) : cells;
    const { mergedCells, merged } = mergeIcons(requiredCells);
    mergedStatus.push(merged);
    const reducedItems = mergedCells.reduce((result, item, index) => {
      result[headerKeys[index]] = item;
      result.id = id;
      if (clickId) result.clickId = clickId;
      result.clickable = clickable;
      return result;
    }, {});
    rowItems.push(reducedItems);
  });
  return {
    rowItems,
    merged: mergedStatus.every((item) => item === true) && (mergedStatus.length === rows.length),
  };
};
