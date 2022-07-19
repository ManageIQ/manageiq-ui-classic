/* eslint-disable no-undef */
import React from 'react';
import PropTypes from 'prop-types';
import { tableData, onSelectRender } from './helper';
import MiqDataTable from '../../miq-data-table';

const ISODatastore = ({
  initialData,
}) => {
  const { headers, rows } = tableData(initialData);
  const onSelect = (selectedRow) => onSelectRender(selectedRow);

  return (
    rows.length > 0 && (
      <MiqDataTable
        rows={rows}
        headers={headers}
        onCellClick={(selectedRow) => onSelect(selectedRow)}
      />
    )
  );
};

export default ISODatastore;

ISODatastore.propTypes = {
  initialData: PropTypes.arrayOf(PropTypes.any),
};

ISODatastore.defaultProps = {
  initialData: [],
};
