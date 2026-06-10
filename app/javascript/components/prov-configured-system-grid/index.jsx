import { useState } from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import { headerData, rowData } from '../miq-data-table/helper';

const ProvConfiguredSystemGrid = ({ initialData }) => {
  const [sortState, setSortState] = useState({
    sortColumn: null,
    sortDirection: 'ASC',
  });

  const { headers, rows } = initialData;

  // Sort rows based on current sort state
  const getSortedRows = () => {
    if (!sortState.sortColumn) {
      return rows;
    }

    const sortedRows = [...rows];
    const columnIndex = headers.findIndex((header) => header.text === sortState.sortColumn);

    if (columnIndex === -1) {
      return rows;
    }

    sortedRows.sort((a, b) => {
      const aValue = a.cells[columnIndex]?.text || '';
      const bValue = b.cells[columnIndex]?.text || '';

      const comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
      return sortState.sortDirection === 'ASC' ? comparison : -comparison;
    });

    return sortedRows;
  };

  // Update headers with current sort state
  const getHeadersWithSortData = () => (
    headers.map((header) => ({
      ...header,
      sort_data: header.text === sortState.sortColumn ? sortState.sortDirection : 'NONE',
    }))
  );

  const sortedRows = getSortedRows();
  const headersWithSort = getHeadersWithSortData();

  const { headerKeys, headerItems } = headerData(headersWithSort, false);
  const miqRows = rowData(headerKeys, sortedRows, false);

  /** Function to sort the table */
  const onSort = (itemKey) => {
    const newSortColumn = itemKey;
    const newSortDirection = sortState.sortColumn === newSortColumn && sortState.sortDirection === 'ASC'
      ? 'DESC'
      : 'ASC';

    setSortState({
      sortColumn: newSortColumn,
      sortDirection: newSortDirection,
    });
  };

  return (
    <div id="prov_configured_system_div">
      <MiqDataTable
        headers={headerItems}
        rows={miqRows.rowItems}
        mode="prov-configured-system-grid-data-table"
        sortable={miqRows.rowItems.length > 1}
        onSort={(headerItem) => onSort(headerItem.key)}
      />
    </div>
  );
};

ProvConfiguredSystemGrid.propTypes = {
  initialData: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    rows: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      cells: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string,
      })),
    })).isRequired,
  }).isRequired,
};

export default ProvConfiguredSystemGrid;

// Made with Bob
