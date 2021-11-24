import React from 'react';
import PropTypes from 'prop-types';
import { tableData } from './helper';
import MiqDataTable from '../../miq-data-table';

const RoleList = ({
  roles, treeBox,
}) => {
  const convertRoles = Object.entries(roles).map(([key, value]) => ({ profile: key, id: value.toString() }));
  const { headers, rows } = tableData(convertRoles);

  /** Function to execute the row's click event */
  const onSelect = (selectedRow) => {
    const item = convertRoles.find((rowItem) => rowItem.id === selectedRow.id);
    if (item) {
      miqTreeActivateNode(treeBox, `g-${item.id}`);
    }
  };

  return (
    <MiqDataTable
      headers={headers}
      rows={rows}
      onCellClick={(item) => onSelect(item)}
      mode="role-list"
    />
  );
};
export default RoleList;

RoleList.propTypes = {
  roles: PropTypes.shape({}).isRequired,
  treeBox: PropTypes.string.isRequired,
};
