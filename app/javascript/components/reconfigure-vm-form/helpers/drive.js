import { TYPES } from './general';

/** Function to cancel the connection of the drive from device  */
export const cancelConnectDrives = (row, data, setData) => {
  const { id } = row;
  const index = id.substring(5);
  const datatableData = data.dataTable.drives;
  datatableData[index].filename = datatableData[index].old_filename;

  const submitDrives = data.submitParams.drives.connect.filter((drive) => drive.id !== id);
  const connectedDriveIds = data.submitParams.driveIds.connect.filter((driveId) => driveId !== id);
  data.changeCounter -= 1;
  setData({
    ...data,
    isLoading: false,
    dataTable: {
      ...data.dataTable,
      drives: datatableData,
    },
    submitParams: {
      ...data.submitParams,
      drives: {
        ...data.submitParams.drives,
        connect: submitDrives,
      },
      driveIds: {
        ...data.submitParams.driveIds,
        connect: connectedDriveIds,
      },
    },
  });
};

/** Function to cancel the disconnection of drives from device  */
export const cancelDisconnectDrives = (row, data, setData) => {
  const { id } = row;
  const index = id.substring(5);
  const datatableData = data.dataTable.drives;
  datatableData[index].filename = datatableData[index].disconnect_filename;

  const submitDrives = data.submitParams.drives.disconnect.filter((drive) => drive.id !== id);
  const disConnectedDriveIds = data.submitParams.driveIds.disconnect.filter((driveId) => driveId !== id);
  data.changeCounter -= 1;
  setData({
    ...data,
    isLoading: false,
    dataTable: {
      ...data.dataTable,
      drives: datatableData,
    },
    submitParams: {
      ...data.submitParams,
      drives: {
        ...data.submitParams.drives,
        disconnect: submitDrives,
      },
      driveIds: {
        ...data.submitParams.driveIds,
        disconnect: disConnectedDriveIds,
      },
    },
  });
};

/** Function to disconnect drives from device  */
export const disconnectDrives = (row, data, setData) => {
  const { id } = row;
  const index = id.substring(5);
  const datatableData = data.dataTable.drives;
  const submitDrives = data.submitParams.drives.disconnect || [];
  const disConnectedDriveIds = data.submitParams.driveIds.disconnect || [];
  datatableData[index].disconnect_filename = datatableData[index].filename;
  datatableData[index].filename = '';
  const disconnectDriveData = {
    id,
    device_name: datatableData[index].device_name,
  };
  submitDrives.push(disconnectDriveData);
  disConnectedDriveIds.push(id);
  data.changeCounter += 1;
  setData({
    ...data,
    isLoading: false,
    dataTable: {
      ...data.dataTable,
      drives: datatableData,
    },
    submitParams: {
      ...data.submitParams,
      drives: {
        ...data.submitParams.drives,
        disconnect: submitDrives,
      },
      driveIds: {
        ...data.submitParams.driveIds,
        disconnect: disConnectedDriveIds,
      },
    },
  });
};

/** Function to check the connect button render options  */
const connectAction = (id, file, data) => {
  if (data.submitParams.driveIds.connect.includes(id)) {
    return {
      is_button: true,
      title: __('Cancel Connect'),
      text: __('Cancel Connect'),
      alt: __('Cancel Connect'),
      kind: 'ghost',
      callback: 'cancelConnectDrives',
    };
  }
  return {
    is_button: true,
    title: __('Connect'),
    text: __('Connect'),
    alt: __('Connect'),
    disabled: !!file,
    kind: 'ghost',
    callback: 'connectDrives',
  };
};

/** Function to check the disconnect button render options  */
const disConnectAction = (id, data) => {
  if (data.submitParams.driveIds.disconnect.includes(id)) {
    return {
      is_button: true,
      title: __('Cancel Disconnect'),
      text: __('Cancel Disconnect'),
      alt: __('Cancel Disconnect'),
      kind: 'ghost',
      callback: 'cancelDisconnectDrives',
      disabled: data.submitParams.driveIds.connect.includes(id),
    };
  }
  return {
    is_button: true,
    title: __('Disconnect'),
    text: __('Disconnect'),
    alt: __('Disconnect'),
    kind: 'ghost',
    callback: 'disconnectDrives',
    disabled: data.submitParams.driveIds.connect.includes(id),
  };
};

/** Function to set the CD/ROM Drive datatable row data  */
export const setDrivesData = (drives, data) => {
  const driveData = [];

  drives.forEach((drive, i) => {
    const id = `drive${i}`;
    driveData[i] = {
      id,
      name: drive.device_name,
      hostFile: drive.filename,
      action: connectAction(id, drive.filename, data),
    };
    if (drive.filename || drive.disconnect_filename) {
      driveData[i].disconnect = disConnectAction(id, data);
    } else {
      driveData[i].disconnect = '';
    }
  });

  return driveData;
};

/** Function to set the CD-ROM drive datatable headers  */
export const getDriveTableHeaders = () => [
  { key: 'name', header: __('Name') },
  { key: 'hostFile', header: __('Host File') },
  { key: 'disconnect', header: __('Disconnect') },
  { key: 'action', header: __('Actions') },
];

/** function to execute drive sub forms submit gets called
 * Drive connect form submission
*/
export const setDriveFormSubmit = (data, setData, formData, renderData) => {
  const { id } = data.editingRow;
  const index = id.substring(5);
  const datatableData = data.dataTable.drives;
  const submitDrives = data.submitParams.drives.connect || [];
  const connectedDriveIds = data.submitParams.driveIds.connect || [];
  const isoSelect = formData.host_file.split(',');

  datatableData[index].old_filename = datatableData[index].filename;
  // eslint-disable-next-line prefer-destructuring
  datatableData[index].filename = isoSelect[0];

  const connectDriveData = {
    id,
    device_name: datatableData[index].device_name,
    filename: datatableData[index].filename,
    storage_id: isoSelect[1],
  };
  submitDrives.push(connectDriveData);
  connectedDriveIds.push(id);
  data.changeCounter += 1;

  setData({
    ...data,
    isLoading: false,
    form: {
      title: renderData.title,
      type: TYPES.RECONFIGURE,
      className: renderData.className,
    },
    dataTable: {
      ...data.dataTable,
      drives: datatableData,
    },
    submitParams: {
      ...data.submitParams,
      drives: {
        ...data.submitParams.drives,
        connect: submitDrives,
      },
      driveIds: {
        ...data.submitParams.driveIds,
        connect: connectedDriveIds,
      },
    },
  });
};
