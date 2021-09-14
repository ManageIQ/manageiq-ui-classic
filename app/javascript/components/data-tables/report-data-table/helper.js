import { SortDirections, ReportSortDirections } from '../../miq-data-table/helper';

/** Function to get the key from sorting object. */
const getSortKey = (sortingColumns) => {
  const keys = sortingColumns ? Object.keys(sortingColumns) : '';
  return keys ? keys[0] : '';
};

/** Function to convert the direction type from pattern-fly to carbon. */
const getSortDirection = (sortKey, sortingColumns) => {
  const direction = (sortingColumns[sortKey] ? sortingColumns[sortKey].direction : '');
  if (direction === ReportSortDirections.DEFAULT) return SortDirections.ASC;
  if (direction === ReportSortDirections.ASC) return SortDirections.DESC;
  if (direction === ReportSortDirections.DESC) return SortDirections.ASC;
  return SortDirections.NONE;
};

/** Function to generate the sorting object from the state object. */
const sortData = (column, sortingColumns) => {
  const sortKey = getSortKey(sortingColumns);
  const isFilteredBy = sortKey === column.key;
  if (!isFilteredBy) {
    return { isFilteredBy };
  }
  return { isFilteredBy, sortDirection: getSortDirection(sortKey, sortingColumns) };
};

/** Function to append sorting data into the table header data. */
const appendSortData = (headerItems, sortingColumns) => headerItems.map((column) => ({
  ...column,
  sortData: sortData(column, sortingColumns),
}));

/** Function to change the sorting direction before fetching new data. */
export const reportSortDirection = (sortKey, sortingColumns) => {
  if (sortingColumns && sortingColumns[sortKey]) {
    const { direction } = sortingColumns[sortKey];
    if (direction === ReportSortDirections.DEFAULT) return ReportSortDirections.DESC;
    if (direction === ReportSortDirections.ASC) return ReportSortDirections.DESC;
    if (direction === ReportSortDirections.DESC) return ReportSortDirections.ASC;
  }
  return ReportSortDirections.ASC;
};

/** Function to get the headers and append data required for sorting. */
export const tableHeaders = (columns, sortingColumns) => {
  const headerItems = columns.map((item) => ({ key: item.property, header: item.header.label }));
  const miqHeaders = appendSortData(headerItems, sortingColumns);
  return miqHeaders;
};

/** Function to get the rows for report table. */
export const tableRows = (rows) => rows.map((row) => ({ ...row, id: row.id.toString() }));

/** Function to get the data for repots table. */
export const tableData = (columns, rows, sortingColumns) => {
  const miqHeaders = tableHeaders(columns, sortingColumns);
  const miqRows = tableRows(rows);
  return { miqHeaders, miqRows };
};
