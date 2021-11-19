import React from 'react';
import { tableData } from './helper';
import MiqDataTable from '../../miq-data-table';

const ButtonGroupList = (props) => {
  const { headers, rows } = tableData(props);

  /** Function to execute the row's click event */
  const onSelect = (selectedRow) => {
    const selected = rows.find((row) => row.id === selectedRow.id);
    miqTreeActivateNode(selected.treeBox, selected.nodeKey);
  };

  return (
    <MiqDataTable
      headers={headers}
      rows={rows}
      onCellClick={(selectedRow) => onSelect(selectedRow)}
      mode="button-group-list"
    />
  );
};

export default ButtonGroupList;
