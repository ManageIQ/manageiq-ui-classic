import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../../miq-data-table';
import {
  CellAction, headerData, rowData,
} from '../../miq-data-table/helper';

export const DataTable = ({
  rows,
  columns,
  inEditMode,
  noCheckboxes,
  settings,
  isLoading,
  pagination,
  total,
  onSelectAll,
  onSort,
  onItemClick,
  onItemSelect,
  onPerPageSelect,
  onPageSet,
  showPagination,
  onPageChange,
}) => {
  const findItem = (item) => rows.find((row) => row.id.toString() === item.id.toString());
  const isVisible = settings && settings.sort_dir && (isLoading || rows.length !== 0);
  const hasCheckbox = !inEditMode() && !noCheckboxes();
  const hasPagination = (!inEditMode() || showPagination()) && isVisible;

  const pageOptions = {
    totalItems: total,
    onPerPageSelect,
    onPageSet,
    pageSizes: pagination.perPageOptions,
    pageSize: pagination.perPage,
    page: pagination.page,
    onPageChange,
  };

  const defaultHeaders = headerData(columns, hasCheckbox);

  const sortData = (column) => {
    const isFilteredBy = settings.sort_col === column.col_idx;
    if (!isFilteredBy) {
      return { isFilteredBy };
    }
    return { isFilteredBy, sortDirection: settings.sort_dir };
  };

  const appendSortData = (headerItems) => headerItems.map((column) => ({
    ...column,
    sortData: sortData(column),
  }));

  defaultHeaders.headerItems = appendSortData(defaultHeaders.headerItems);

  const tempRows = rowData(defaultHeaders.headerKeys, rows, hasCheckbox);
  const [miqRows] = useState(tempRows.rowItems);
  if (tempRows.merged) {
    defaultHeaders.headerKeys.splice(0, 1);
    defaultHeaders.headerItems.splice(0, 1);
  }
  const [miqHeaders] = useState(defaultHeaders);

  /** Function to execute the row's click event */
  const onCellClick = (selectedRow, cellType, event) => {
    switch (cellType) {
      case CellAction.selectAll: onSelectAll(rows, event.target); break;
      case CellAction.itemSelect: onItemSelect(findItem(selectedRow), event.target.checked); break;
      case CellAction.itemClick: onItemClick(findItem(selectedRow)); break;
      default: onItemClick(findItem(selectedRow)); break;
    }
  };

  const renderTable = () => (
    <MiqDataTable
      rows={miqRows}
      headers={miqHeaders.headerItems}
      onCellClick={(selectedRow, cellType, event) => onCellClick(selectedRow, cellType, event)}
      sortable
      rowCheckBox={hasCheckbox}
      showPagination={hasPagination}
      pageOptions={pageOptions}
      mode="static-gtl-view"
      gridChecks={ManageIQ.gridChecks}
      onSort={(headerItem) => onSort({ headerId: headerItem.col_idx, isAscending: settings.sort_dir === 'ASC' })}
    />
  );

  return (
    <div className="miq-data-table">
      { isLoading && <div className="spinner spinner-lg" /> }
      { rows.length !== 0 && renderTable() }
    </div>
  );
};

DataTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.any).isRequired,
  columns: PropTypes.arrayOf(PropTypes.any).isRequired,
  settings: PropTypes.objectOf(PropTypes.any).isRequired,
  pagination: PropTypes.objectOf(PropTypes.any).isRequired,
  total: PropTypes.number.isRequired,
  inEditMode: PropTypes.func.isRequired,
  noCheckboxes: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  onSelectAll: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  onItemClick: PropTypes.func.isRequired,
  onItemSelect: PropTypes.func.isRequired,
  onPerPageSelect: PropTypes.func.isRequired,
  onPageSet: PropTypes.func.isRequired,
  showPagination: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

DataTable.defaultProps = {
  isLoading: undefined,
};

export default DataTable;
