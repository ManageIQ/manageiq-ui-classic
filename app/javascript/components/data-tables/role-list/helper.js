/** Function to extract header data for table. */
const headerData = () => [{ header: 'Profile', key: 'profile' }];

/** Function to extract row data for the table. */
const rowData = (roles) => {
  roles.forEach((item) => {
    item.profile = { text: item.profile, icon: 'fa-lg ff ff-group' };
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
