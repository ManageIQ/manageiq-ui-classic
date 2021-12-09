import React from 'react';
import classNames from 'classnames';

/** Function to extract header data for table. */
const headerData = () => [{ header: '', key: 'icon' }, { header: 'Profile', key: 'profile' }];

/** Function to extract row data for the table. */
const rowData = (roles) => {
  roles.forEach((item) => {
    item.icon = <i className={classNames('fa-lg', 'ff ff-group')} />;
    item.clickable = true;
  });
  return roles;
};

/** Function to extract data for role list table. */
export const tableData = (roles) => {
  const headers = headerData();
  const rows = rowData(roles);
  return { headers, rows };
};
