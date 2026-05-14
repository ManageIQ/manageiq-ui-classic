import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import { tableData } from './helper';

const OldDialogsFoldersTable = ({ folders }) => {
  const headers = [
    {
      key: 'name',
      header: '',
    },
  ];
  const rows = tableData(folders);

  const handleCellClick = (selectedRow, cellType, _event) => {
    if (cellType === 'itemClick' && selectedRow && selectedRow.id) {
      const folderId = selectedRow.id.replace('folder-', '');

      if (window.miqTreeActivateNode) {
        window.miqTreeActivateNode('old_dialogs_tree', `xx-MiqDialog_${folderId}`);
      }
    }
  };

  return (
    <div className="old-dialogs-folders-table">
      <MiqDataTable
        headers={headers}
        rows={rows.rowItems}
        onCellClick={handleCellClick}
        mode="miq-data-table-default"
        size="md"
        sortable={false}
        rowCheckBox={false}
        showPagination={false}
      />
    </div>
  );
};

OldDialogsFoldersTable.propTypes = {
  folders: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    )
  ).isRequired,
};

export default OldDialogsFoldersTable;
