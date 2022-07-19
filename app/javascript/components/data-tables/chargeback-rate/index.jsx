import React from 'react';
import PropTypes from 'prop-types';
import { tableData } from './helper';
import MiqDataTable from '../../miq-data-table';

const ChargebackRate = ({ initialData, hasOptions }) => {
  const { headers, rows } = tableData(initialData, hasOptions);

  return (
    rows.length > 0 && (
      <MiqDataTable
        rows={rows}
        headers={headers}
        mode="chargeback-rate"
      />
    )
  );
};

export default ChargebackRate;

ChargebackRate.propTypes = {
  initialData: PropTypes.arrayOf(PropTypes.any).isRequired,
  hasOptions: PropTypes.bool.isRequired,
};
