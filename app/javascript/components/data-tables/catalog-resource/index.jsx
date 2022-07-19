import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../../miq-data-table';
import { tableData, onSelectEvent } from './helper';

const CatalogResouce = ({ initialData }) => {
  const { headers, rows, merged } = tableData(initialData);

  if (merged) {
    headers.splice(0, 1);
  }

  return (
    rows.length > 0 && (
      <MiqDataTable
        rows={rows}
        headers={headers}
        onCellClick={(selectedRow) => onSelectEvent(selectedRow, initialData)}
        mode="catalog-resource"
      />
    )
  );
};

export default CatalogResouce;

CatalogResouce.propTypes = {
  initialData: PropTypes.shape({}).isRequired,
};
