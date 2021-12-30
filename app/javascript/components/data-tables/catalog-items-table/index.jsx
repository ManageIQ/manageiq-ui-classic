import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../../miq-data-table';
import { tableData, onSelectRender } from './helper';

const CatalogItemsTable = ({ initialData, record }) => {
  const { headers, rows } = tableData(initialData);
  const onSelect = (selectedRow) => onSelectRender(record, selectedRow, rows);

  return (
    rows.length > 0 && (
      <MiqDataTable
        rows={rows}
        headers={headers}
        onCellClick={(selectedRow) => onSelect(selectedRow)}
        mode="db-list"
      />
    )
  );
};

export default CatalogItemsTable;

CatalogItemsTable.propTypes = {
  initialData: PropTypes.arrayOf(PropTypes.any),
  record: PropTypes.objectOf(PropTypes.any).isRequired,
};

CatalogItemsTable.defaultProps = {
  initialData: [],
};
