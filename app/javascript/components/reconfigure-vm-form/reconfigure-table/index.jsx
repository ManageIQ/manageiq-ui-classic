import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
import classNames from 'classnames';
import MiqDataTable from '../../miq-data-table';

const ReconfigureTable = ({
  label, headers, rows, addButtonLabel, buttonClick, onCellClick, formType,
}) => {
  const renderAddButton = () => addButtonLabel && (
    <Button
      kind="primary"
      className={`${formType}-add bx--btn bx--btn--primary pull-right reconfigure-add-button`}
      type="button"
      variant="contained"
      onClick={() => buttonClick('new', formType, 'add')}
    >
      {addButtonLabel}
    </Button>
  );
  return (
    <div className={classNames(`${formType}-table`, 'reconfigure-form-table')}>
      <div className="form-section-title">
        <h3>{label}</h3>
        {renderAddButton()}
      </div>
      <MiqDataTable
        headers={headers}
        rows={rows}
        onCellClick={(selectedRow, cellType) => onCellClick(selectedRow, cellType)}
        mode={`${formType}-table-list`}
      />
    </div>
  );
};

ReconfigureTable.propTypes = {
  label: PropTypes.string,
  headers: PropTypes.arrayOf(PropTypes.any),
  rows: PropTypes.arrayOf(PropTypes.any),
  addButtonLabel: PropTypes.string,
  formType: PropTypes.string,
  onCellClick: PropTypes.func,
  buttonClick: PropTypes.func,
};

ReconfigureTable.defaultProps = {
  headers: undefined,
  rows: undefined,
  onCellClick: undefined,
  buttonClick: undefined,
  addButtonLabel: '',
  formType: '',
  label: '',
};
export default ReconfigureTable;
