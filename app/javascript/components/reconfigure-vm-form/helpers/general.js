/** Function to get the value from selected datatable cells. */
export const getCellData = (obj, value) => {
  const nameCell = obj.cells.find((cell) => cell.id === `${obj.id}:${value}`);
  return nameCell ? nameCell.value : '';
};

/** Function to get the value from selected object
 * needed from the form display methods
 */
export const getObjectData = (index, data, field) => data[index][field];

/** Function to set all forms types present in the reconfigure vm feature  */
export const TYPES = {
  RECONFIGURE: 'reconfigure',
  DISK: 'disk',
  NETWORK: 'network',
  DRIVE: 'drive',
  RESIZE: 'resize',
  EDITNETWORK: 'editNetwork',
};

/** Function to set all forms data in the reconfigure vm feature  */
export const formsData = {
  reconfigure: {
    title: __('Options'),
    className: 'reconfigure_form',
  },
  disk: {
    title: __('Add Disk'),
    className: 'disk_form',
  },
  resize: {
    title: __('Resize Disk'),
    className: 'disk_form',
  },
  network: {
    title: __('Add Network Adapters'),
    className: 'network_form',
  },
  editNetwork: {
    title: __('Edit Network Adapters'),
    className: 'network_form',
  },
  drive: {
    title: __('Connect CD/DVD Drives'),
    className: 'drive_form',
  },
};

/** Function to get the value in MB
 * converts the value to GB to MB based on the passed unit
 */
export const sizeInMB = (value, unit) => (unit === __('GB') ? value * 1024 : value);
