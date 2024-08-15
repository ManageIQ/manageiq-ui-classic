import React from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableSelectAll,
  TableSelectRow,
} from 'carbon-components-react';
import classNames from 'classnames';
import MiqPagination from '../miq-pagination';
import {
  CellAction, DefaultKey, sortableRows, SortDirections,
} from './helper';
import MiqTableCell from './miq-table-cell';

const MiqDataTable = ({
  headers,
  rows,
  onCellClick,
  mode,
  sortable,
  rowCheckBox,
  showPagination,
  pageOptions,
  gridChecks,
  onSort,
  size,
  stickyHeader,
  truncateText,
}) => {
  const isRowSelected = (itemId) => gridChecks.includes(itemId);
  const propRows = rows;

  const isAllSelected = rows.every((row) => gridChecks.includes(row.id));

  /** Function to print the header label.
   * The DefaultKey is used to identify the headers which needs to be blank. */
  const headerLabel = (header) => (header.split('_')[0] === DefaultKey ? '' : header);

  /** Function to render the select all checkbox in header. */
  const selectAll = (getSelectionProps) => (
    <TableSelectAll
      {...getSelectionProps({
        rows,
        onClick: (event) => onCellClick(rows, CellAction.selectAll, event),
      })}
      checked={isAllSelected}
    />
  );

  /** Function to render the checkbox for each row. */
  const renderRowCheckBox = (getSelectionProps, row) => (
    <TableSelectRow
      {...getSelectionProps({
        row,
        onClick: (event) => onCellClick(row, CellAction.itemSelect, event),
      })}
      checked={isRowSelected(row.id)}
    />
  );

  /** Function to return the sort arrow direction. */
  const headerSortDirection = (sortData) => {
    if (sortData && sortData.sortDirection) {
      if (!(sortData.sortDirection === SortDirections.ASC)) {
        return SortDirections.ASC;
      }
      if (!(!!sortData.sortDirection === SortDirections.ASC)) {
        return SortDirections.DESC;
      }
      return SortDirections.NONE;
    }
    return SortDirections.NONE;
  };

  const headerSortingData = ({ sortData }) => {
    if (!sortable || !sortData) {
      return { sortHeader: false, sortDirection: SortDirections.NONE };
    }
    const sortHeader = sortData.isFilteredBy || false;
    const sortDirection = headerSortDirection(sortData);
    return { sortHeader, sortDirection };
  };

  /** Function to render the header cells. */
  const renderHeaders = (getHeaderProps) => (headers.map((header) => {
    const { sortHeader, sortDirection } = headerSortingData(header);
    let isSortable = true;
    if (header.header.split('_')[0] === DefaultKey) {
      isSortable = false;
    }
    return (
      <TableHeader
        {...getHeaderProps({ header, isSortHeader: { sortable } })}
        onClick={() => sortable && onSort(header)}
        isSortable={isSortable}
        isSortHeader={sortHeader}
        sortDirection={sortDirection}
        className={
          classNames('miq-data-table-header', (header.contentButton ? 'header-button' : ''), (header.actionCell ? 'action-cell-holder' : ''))
        }
      >
        {headerLabel(header.header)}
      </TableHeader>
    );
  })
  );

  /** Function to render the cells of each row. */
  const renderCells = (row) => (
    row.cells.map((cell, index) => (
      <MiqTableCell
        key={`${index.toString()}-cellKey`}
        onCellClick={onCellClick}
        cell={cell}
        row={row}
        truncate={truncateText}
      />
    ))
  );

  /** Function to identify if the row is clickable or not and the returns a class name */
  const classNameRow = (item) => {
    if (item) {
      const { clickable, id } = item;
      if (clickable === false) return 'simple-row';
      if (clickable === true || clickable === null) {
        return (gridChecks.includes(id)
          ? 'clickable-row bx--data-table--selected'
          : 'clickable-row');
      }
    }
    return '';
  };

  return (
    <div className={classNames('miq-data-table', mode)}>
      <DataTable
        rows={rows}
        headers={headers}
        isSortable={sortable}
        size={size}
        sortDirection="ASC"
        stickyHeader={stickyHeader}
      >
        {({
          rows, getTableProps, getHeaderProps, getRowProps, getSelectionProps,
        }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {rowCheckBox && selectAll(getSelectionProps)}
                {renderHeaders(getHeaderProps)}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortableRows(rows).map((row, index) => {
                const item = propRows[index];
                return (
                  <TableRow
                    {...getRowProps({ row })}
                    title={(item && item.clickable) ? __('Click to view details') : ''}
                    className={classNameRow(item)}
                    tabIndex={(item && item.clickable === false) ? '' : index.toString()}
                    onKeyPress={(event) => onCellClick(row, CellAction.itemClick, event)}
                  >
                    {rowCheckBox && renderRowCheckBox(getSelectionProps, row)}
                    {renderCells(row)}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
      {
        showPagination && rows.length > 0 && <MiqPagination pageOptions={pageOptions} />
      }
    </div>
  );
};

MiqDataTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.any),
  rows: PropTypes.arrayOf(PropTypes.any),
  mode: PropTypes.string,
  onCellClick: PropTypes.func,
  sortable: undefined || PropTypes.bool,
  rowCheckBox: undefined || PropTypes.bool,
  showPagination: PropTypes.bool,
  pageOptions: PropTypes.shape({
    totalItems: PropTypes.number,
    onPageChange: PropTypes.func,
    pageSizes: PropTypes.arrayOf(PropTypes.number),
    pageSize: PropTypes.number,
    page: PropTypes.number,
  }),
  gridChecks: PropTypes.arrayOf(PropTypes.any),
  onSort: PropTypes.func,
  size: PropTypes.string,
  stickyHeader: PropTypes.bool,
  truncateText: PropTypes.bool,
};

MiqDataTable.defaultProps = {
  headers: [],
  rows: [],
  mode: '',
  onCellClick: undefined,
  sortable: false,
  rowCheckBox: false,
  showPagination: false,
  pageOptions: {
    totalItems: 10, page: 1, pageSizes: [5, 10, 20, 50, 100, 200], pageSize: 20,
  },
  gridChecks: [],
  onSort: undefined,
  size: 'lg',
  stickyHeader: false,
  truncateText: true,
};

export default MiqDataTable;
