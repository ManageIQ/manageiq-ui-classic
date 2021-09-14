/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
import { DataTable } from './DataTable';

// FIXME: will not need the text undefined check once the icon column is removed from list view, that's the left most column without text
const translateHeaderText = (heads) => heads.map((h) => ({ ...h, header_text: typeof h.text !== 'undefined' ? __(h.text) : '' }));

export const StaticGTLView = ({
  pagination,
  rows,
  head,
  inEditMode,
  noCheckboxes,
  settings,
  total,
  onPageSet,
  onPerPageSelect,
  onItemSelect,
  onItemClick,
  onSelectAll,
  onSort,
  showPagination,
  onPageChange,
}) => {
  const miqDataTable = () => (
    <DataTable
      rows={rows}
      columns={translateHeaderText(head)}
      inEditMode={inEditMode}
      noCheckboxes={noCheckboxes}
      settings={settings}
      pagination={pagination}
      total={total}
      onSelectAll={onSelectAll}
      onSort={(headerItem) => onSort(headerItem)}
      onItemClick={onItemClick}
      onItemSelect={onItemSelect}
      onPerPageSelect={onPerPageSelect}
      onPageSet={onPageSet}
      showPagination={showPagination}
      onPageChange={onPageChange}
    />
  );
  return miqDataTable();
};

StaticGTLView.defaultProps = {
  pagination: { page: 1, perPage: 10, perPageOptions: [5, 10, 20, 50, 100, 200] },
  inEditMode: (foo) => console.log('inEditMode', foo),
  onSort: (headerId, isAscending) => console.log('onSort', headerId, isAscending),
  onPerPageSelect: (foo) => console.log('onPerPageSelect', foo),
  onPageChange: (foo, bar) => console.log('onPageChange', foo, bar),
  onPageSet: (foo) => console.log('onPageSet', foo),
  onItemButtonClick: (foo) => console.log('onItemButtonClick', foo),
  onItemClick: (foo) => console.log('onItemClick', foo),
  onItemSelect: (foo) => console.log('onItemSelect', foo),
  total: 128,
};

StaticGTLView.propTypes = {
  settings: PropTypes.objectOf(PropTypes.any).isRequired,
  rows: PropTypes.arrayOf(PropTypes.any).isRequired,
  head: PropTypes.arrayOf(PropTypes.any).isRequired,
  inEditMode: PropTypes.func.isRequired,
  noCheckboxes: PropTypes.func.isRequired,
  total: PropTypes.number,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
    perPageOptions: PropTypes.arrayOf(PropTypes.number),
  }),
  onItemSelect: PropTypes.func,
  onCellClick: PropTypes.func,
  onSort: PropTypes.func,
  onSelectAll: PropTypes.func,
  onPerPageSelect: PropTypes.func,
  onPageSet: PropTypes.func,
  onPageChange: PropTypes.func,
};
