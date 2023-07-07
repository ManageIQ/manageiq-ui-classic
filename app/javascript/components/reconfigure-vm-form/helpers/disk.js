import { TYPES, sizeInMB } from './general';

/** Function to execute when the delete backing toggle changed */
export const backupDelete = (id, data, setData) => {
  let backingIds = data.submitParams.diskIds.backup || [];
  const index = id.substring(4);
  if (backingIds.includes(id)) {
    // code to remove from delete backlog
    data.dataTable.disks[index].delete_backing = false;
    backingIds = backingIds.filter((diskId) => diskId !== id);
  } else {
    // code to add the disk to delete backlog
    data.dataTable.disks[index].delete_backing = true;
    backingIds.push(id);
  }
  setData({
    ...data,
    dataTable: {
      ...data.dataTable,
      disks: data.dataTable.disks,
    },
    submitParams: {
      ...data.submitParams,
      diskIds: {
        ...data.submitParams.diskIds,
        backup: backingIds,
      },
    },
  });
};

/** function to delete disk executed when the delete button gets clicked for the disk datatable */
export const deleteDisk = (row, data, setData) => {
  let dataTableData = data.dataTable.disks;
  let addDisks = data.submitParams.disks.add || [];
  const deleteDisks = data.submitParams.disks.delete || [];
  let addDiskIds = data.submitParams.diskIds.add || [];
  const deleteIds = data.submitParams.diskIds.delete || [];

  if (addDiskIds.includes(row.id)) {
    // delete from the newly added disks
    // eslint-disable-next-line no-alert
    if (window.confirm(__('Are you sure you want to delete this entry?'))) {
      dataTableData = data.dataTable.disks.filter((disk) => disk.id !== row.id);
      addDisks = data.submitParams.disks.add.filter((disk) => disk.id !== row.id);
      addDiskIds = data.submitParams.diskIds.add.filter((diskId) => diskId !== row.id);
      data.changeCounter -= 1;
    }
  } else {
    // remove from the existing disk datatable
    const index = row.id.substring(4);
    const currentRow = data.dataTable.disks[index];
    currentRow.add_remove = 'remove';
    const deleteDiskData = {
      id: row.id,
      disk_name: currentRow.hdFilename,
      delete_backing: deleteIds.includes(row.id),
    };
    deleteDisks.push(deleteDiskData);
    deleteIds.push(row.id);
    data.changeCounter += 1;
  }
  setData({
    ...data,
    dataTable: {
      ...data.dataTable,
      disks: dataTableData,
    },
    submitParams: {
      ...data.submitParams,
      disks: {
        ...data.submitParams.disks,
        add: addDisks,
        delete: deleteDisks,
      },
      diskIds: {
        ...data.submitParams.diskIds,
        add: addDiskIds,
        delete: deleteIds,
      },
    },
  });
};

/** Cancel delete disk function
 *  button click from datatable
 */
export const cancelDeleteDisk = (row, data, setData) => {
  const submitDisks = data.submitParams.disks.delete.filter((disk) => disk.id !== row.id);
  const deletedDiskIds = data.submitParams.diskIds.delete.filter((id) => id !== row.id);
  data.changeCounter -= 1;
  setData({
    ...data,
    submitParams: {
      ...data.submitParams,
      disks: {
        ...data.submitParams.disks,
        delete: submitDisks,
      },
      diskIds: {
        ...data.submitParams.diskIds,
        delete: deletedDiskIds,
      },
    },
  });
};

/** Cancel resize disk function - restore the previous data size
 *  button click from datatable
 */
export const cancelResizeDisk = (row, data, setData) => {
  const { id } = row;
  const index = id.substring(4);
  data.dataTable.disks[index].hdSize = data.dataTable.disks[index].old_size;
  data.dataTable.disks[index].hdUnit = data.dataTable.disks[index].old_unit;
  const submitDisks = data.submitParams.disks.resize.filter((disk) => disk.id !== row.id);
  const resizeDiskIds = data.submitParams.diskIds.resize.filter((id) => id !== row.id);
  data.changeCounter -= 1;
  setData({
    ...data,
    submitParams: {
      ...data.submitParams,
      disks: {
        ...data.submitParams.disks,
        resize: submitDisks,
      },
      diskIds: {
        ...data.submitParams.diskIds,
        resize: resizeDiskIds,
      },
    },
  });
};

/** Function to check the button need to be disabled or not */
const diskDisableButton = (id, data) => {
  if (data.submitParams.diskIds.delete.includes(id) || data.submitParams.diskIds.add.includes(id)) {
    return true;
  }
  return false;
};

/** Function to check the delete button rendering */
const diskAction = (id, data) => {
  if (data.submitParams.diskIds.delete.includes(id)) {
    return {
      is_button: true,
      title: __('Cancel Delete'),
      text: __('Cancel Delete'),
      alt: __('Cancel Delete'),
      kind: 'ghost',
      callback: 'cancelDeleteDisk',
    };
  }
  return {
    is_button: true,
    title: __('Delete'),
    text: __('Delete'),
    alt: __('Delete'),
    kind: 'ghost',
    disabled: data.submitParams.diskIds.resize.includes(id),
    callback: 'deleteDisk',
  };
};

/** Function to check the resize button rendering */
const resizeAction = (id, data) => {
  if (data.submitParams.diskIds.resize.includes(id)) {
    return {
      is_button: true,
      title: __('Cancel Resize'),
      text: __('Cancel Resize'),
      alt: __('Cancel Resize'),
      kind: 'ghost',
      callback: 'cancelResizeDisk',
    };
  }
  return {
    is_button: true,
    title: __('Resize'),
    text: __('Resize'),
    alt: __('Resize'),
    kind: 'ghost',
    callback: 'resizeDisk',
    disabled: diskDisableButton(id, data),
  };
};

/** Function to validate the disk size
 * This function will validate the disk size in resize form
 */
export const validateDiskSize = (value, unit, minSize, minUnit) => {
  if (!Number.isNaN(value)) {
    const valueInMb = sizeInMB(value, unit);
    const minSizeInMb = sizeInMB(minSize, minUnit);
    if (valueInMb >= minSizeInMb) {
      return true;
    }
  }
  return false;
};

/** Function to set the Disk datatable row data
 * This formatting is needed for resize function validation
 */
export const formatDiskData = (disks) => {
  disks.forEach((disk) => {
    disk.orgHdSize = disk.hdSize;
    disk.orgHdUnit = disk.hdUnit;
  });

  return disks;
};

/** Function to set the Disk datatable row data  */
export const setDiskData = (disks, roles, data, setData) => {
  const diskData = [];
  disks.forEach((disk, i) => {
    const id = `disk${i}`;
    diskData[i] = {
      id,
      name: disk.hdFilename || ' ',
      type: disk.hdType,
      size: disk.hdSize,
      unit: disk.hdUnit,
      action: diskAction(id, data),
    };
    if (roles.isVmwareInfra) {
      diskData[i].dependent = disk.cb_dependent ? __('Yes') : __('No');
      diskData[i].mode = disk.hdMode || __('None');
      diskData[i].controller = disk.new_controller_type || __('None');
    }
    if (!roles.isVmwareCloud) {
      diskData[i].backing = {
        is_toggle: true,
        labelText: __('Delete Backing'),
        labelA: __('Yes'),
        labelB: __('No'),
        toggled: !!disk.delete_backing,
        ontoggle: () => backupDelete(id, data, setData),
        disabled: diskDisableButton(id, data),
      };
    }
    if (roles.isRedhat) {
      diskData[i].bootable = disk.cb_bootable === true ? __('Yes') : __('No');
    }
    if (roles.allowDiskSizeChange) {
      diskData[i].resize = resizeAction(id, data);
    }
  });
  return diskData;
};

/** Function to set the Disk datatable headers  */
export const getDiskTableHeaders = (roles) => {
  const headers = [
    { key: 'name', header: __('Name') },
    { key: 'type', header: __('Type') },
    { key: 'size', header: __('Size') },
    { key: 'unit', header: __('Unit') },
  ];
  if (roles.isVmwareInfra) {
    headers.push(
      { key: 'mode', header: __('Mode') },
      { key: 'controller', header: __('Controller Type') },
      { key: 'dependent', header: __('Dependent') }
    );
  }
  if (!roles.isVmwareCloud) {
    headers.push({ key: 'backing', header: __('Delete Backing') });
  }
  if (roles.isRedhat) {
    headers.push({ key: 'bootable', header: __('Bootable') });
  }
  if (roles.allowDiskSizeChange) {
    headers.push({ key: 'resize', header: __('Resize') });
  }
  headers.push({ key: 'action', header: __('Action'), contentButton: true });
  return headers;
};

/** function to execute disk sub forms submit gets called
 * Disk add, resize function
*/
export const setDiskFormSubmit = (data, setData, formData, roles, renderData) => {
  const dataTableData = data.dataTable.disks || [];
  if (data.form.action === 'add') {
    // code for add
    const id = `disk${dataTableData.length}`;
    const diskDatatableData = {
      id,
      hdFilename: '',
      hdType: formData.type,
      hdSize: formData.size,
      hdUnit: formData.unit,
      add_remove: data.form.action,
    };
    const submitDiskData = {
      id,
      disk_size_in_mb: sizeInMB(formData.size, formData.unit),
      thin_provisioned: formData.type === 'thin',
      type: formData.type,
    };
    if (roles.isVmwareInfra) {
      diskDatatableData.hdMode = formData.mode;
      diskDatatableData.new_controller_type = formData.controller;
      diskDatatableData.cb_dependent = formData.dependent || false;
      submitDiskData.persistent = formData.hdMode;
      submitDiskData.new_controller_type = formData.controller;
      submitDiskData.dependent = formData.dependent || false;
    }
    if (!roles.isVmwareCloud) {
      diskDatatableData.backing = false;
    }
    if (roles.isRedhat) {
      diskDatatableData.cb_bootable = formData.bootable || false;
      submitDiskData.bootable = formData.bootable || false;
    }
    data.submitParams.disks.add.push(submitDiskData);
    data.submitParams.diskIds.add.push(diskDatatableData.id);
    dataTableData.push(diskDatatableData);
  } else {
    // code for resize option
    const { id } = data.editingRow;
    const index = id.substring(4);
    dataTableData[index].old_size = dataTableData[index].hdSize;
    dataTableData[index].hdSize = formData.size;
    dataTableData[index].old_unit = dataTableData[index].hdUnit;
    dataTableData[index].hdUnit = formData.unit;
    const resizeData = {
      id,
      disk_name: dataTableData[index].hdFilename,
      disk_size_in_mb: sizeInMB(formData.size, formData.unit),
    };
    data.submitParams.disks.resize.push(resizeData);
    data.submitParams.diskIds.resize.push(id);
  }
  data.changeCounter += 1;
  setData({
    ...data,
    dataTable: {
      ...data.dataTable,
      disks: dataTableData,
    },
    form: {
      title: renderData.title,
      type: TYPES.RECONFIGURE,
      className: renderData.className,
    },
  });
};
