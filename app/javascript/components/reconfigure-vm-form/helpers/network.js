import { TYPES, formsData } from './general';

/** Function which executes when the cancel edit button gets clicked */
export const cancelEditNetwork = (row, data, setData, roles) => {
  const index = row.id.substring(7);
  const networkRows = data.dataTable.networkAdapters;

  if (!roles.isVmwareCloud) {
    networkRows[index].vlan = networkRows[index].old_vlan;
  }

  if (roles.isVmwareCloud) {
    networkRows[index].network = networkRows[index].old_network;
  }
  const submitNetworks = data.submitParams.networks.edit.filter((network) => network.id !== row.id);
  const editedNetworkIds = data.submitParams.networkIds.edit.filter((id) => id !== row.id);

  data.dataTable.networkAdapters = networkRows;
  data.changeCounter -= 1;

  setData({
    ...data,
    submitParams: {
      ...data.submitParams,
      networks: {
        ...data.submitParams.networks,
        edit: submitNetworks,
      },
      networkIds: {
        ...data.submitParams.networkIds,
        edit: editedNetworkIds,
      },
    },
  });
};

/** Function which executes when the delete button gets clicked */
export const deleteNetwork = (row, data, setData, roles) => {
  let dataTableData = data.dataTable.networkAdapters || [];
  let submitNetworks = data.submitParams.networks.add || [];
  let addNetworkIds = data.submitParams.networkIds.add || [];
  const deleteNetworksData = data.submitParams.networks.delete || [];
  const deletedNetworkIds = data.submitParams.networkIds.delete || [];

  if (data.submitParams.networkIds.add.includes(row.id)) {
    // remove from the newly added networks
    // eslint-disable-next-line no-alert
    if (window.confirm(__('Are you sure you want to delete this entry?'))) {
      dataTableData = data.dataTable.networkAdapters.filter((network) => network.id !== row.id);
      submitNetworks = data.submitParams.networks.add.filter((network) => network.id !== row.id);
      addNetworkIds = data.submitParams.networkIds.add.filter((id) => id !== row.id);
    }
    data.changeCounter -= 1;
  } else {
    // remove from the existing networks
    const index = row.id.substring(7);
    const deleteNetworkData = {
      id: row.id,
      network: {
        name: dataTableData[index].name,
        mac: dataTableData[index].mac,
        add_remove: 'remove',
      },
    };
    if (!roles.isVmwareCloud) {
      deleteNetworkData.network.vlan = dataTableData[index].vlan;
    }
    if (roles.isVmwareCloud) {
      deleteNetworkData.network.network = dataTableData[index].network;
    }
    deleteNetworksData.push(deleteNetworkData);
    deletedNetworkIds.push(row.id);
    data.changeCounter += 1;
  }
  setData({
    ...data,
    dataTable: {
      ...data.dataTable,
      networkAdapters: dataTableData,
    },
    submitParams: {
      ...data.submitParams,
      networks: {
        ...data.submitParams.networks,
        add: submitNetworks,
        delete: deleteNetworksData,
      },
      networkIds: {
        ...data.submitParams.networkIds,
        add: addNetworkIds,
        delete: deletedNetworkIds,
      },
    },
  });
};

/** Function which executes when the cancel delete button gets clicked */
export const cancelDeleteNetwork = (row, data, setData) => {
  const deleteNetworksData = data.submitParams.networks.delete.filter((network) => network.id !== row.id);
  const deletedNetworkIds = data.submitParams.networkIds.delete.filter((id) => id !== row.id);
  data.changeCounter -= 1;
  setData({
    ...data,
    submitParams: {
      ...data.submitParams,
      networks: {
        ...data.submitParams.networks,
        delete: deleteNetworksData,
      },
      networkIds: {
        ...data.submitParams.networkIds,
        delete: deletedNetworkIds,
      },
    },
  });
};

/** Function to set the Network datatable row data - name */
const getNetworkName = (id, data) => {
  if (data.submitParams.networkIds.add.includes(id)) {
    return __('to be determined');
  }
  return __(' ');
};

/** Function to set the Network datatable row data - mac */
const getNetworkMac = (id, data) => {
  if (data.submitParams.networkIds.add.includes(id)) {
    return __('not available yet');
  }
  return __(' ');
};

/** Function to check edit button should be disabled or not */
const disableNetworkEditButton = (id, data) => data.submitParams.networkIds.add.includes(id) || data.submitParams.networkIds.delete.includes(id);

/** Function to check and render the network edit button */
const networkEditAction = (id, data) => {
  if (data.submitParams.networkIds.edit.includes(id)) {
    return {
      is_button: true,
      title: __('Cancel Edit'),
      text: __('Cancel Edit'),
      alt: __('Cancel Edit'),
      kind: 'ghost',
      callback: 'cancelEditNetwork',
      disabled: disableNetworkEditButton(id, data),
    };
  }
  return {
    is_button: true,
    title: __('Edit'),
    text: __('Edit'),
    alt: __('Edit'),
    kind: 'ghost',
    disabled: disableNetworkEditButton(id, data),
    callback: 'editNetwork',
  };
};

/** Function to check and render the network delete button */
const networkDeleteAction = (id, data) => {
  if (data.submitParams.networkIds.delete.includes(id)) {
    return {
      is_button: true,
      title: __('Cancel Delete'),
      text: __('Cancel Delete'),
      alt: __('Cancel Delete'),
      kind: 'ghost',
      callback: 'cancelDeleteNetwork',
    };
  }
  return {
    is_button: true,
    title: __('Delete'),
    text: __('Delete'),
    alt: __('Delete'),
    kind: 'ghost',
    callback: 'deleteNetwork',
    disabled: data.submitParams.networkIds.edit.includes(id),
  };
};

/** Function to set the Network datatable row data  */
export const setNetworkData = (networks, roles, data) => {
  const networkData = [];
  networks.forEach((network, i) => {
    const id = `network${i}`;
    const name = network.name ? network.name : getNetworkName(id, data);
    const mac = network.mac ? network.mac : getNetworkMac(id, data);
    networkData[i] = {
      id,
      name,
      mac,
      action: networkDeleteAction(id, data),
      edit: networkEditAction(id, data),
    };
    if (!roles.isVmwareCloud) {
      networkData[i].vlan = network.vlan;
    }
    if (roles.isVmwareCloud) {
      networkData[i].network = network.network || __('None');
    }
  });
  return networkData;
};

/** Function to set the Network datatable headers  */
export const getNetworkTableHeaders = (roles) => {
  const headers = [
    { key: 'name', header: __('Name') },
    { key: 'mac', header: __('MAC address') },
  ];
  if (!roles.isVmwareCloud) {
    headers.push({ key: 'vlan', header: __('vLan') });
  }
  if (roles.isVmwareCloud) {
    headers.push({ key: 'network', header: __('Network') });
  }
  headers.push({ key: 'edit', header: __('Edit'), contentButton: true }, { key: 'action', header: __('Action'), contentButton: true });
  return headers;
};

/** Setting up the network form details when the form loads for cloud */
export const setNetworkOptions = (id, data, setData, type, action, row) => {
  API.get(`/api/cloud_networks?expand=resources&attributes=name&filter[]=orchestration_stack_id=${id}`).then(({ resources }) => {
    const networkOptions = resources.map((item) => (
      item.name
    ));
    setData({
      ...data,
      isLoading: false,
      networkOptions,
      editingRow: row,
      form: {
        title: formsData[type].title,
        type,
        action,
        className: formsData[type].className,
      },
    });
  });
};

/** Function to execute the network form data submission
 * network add, edit function
*/
export const setNetworkFormSubmit = (data, setData, formData, roles, renderData) => {
  if (data.form.action === 'add') {
    // code for add function
    const id = `network${data.dataTable.networkAdapters.length}`;
    const networkData = {
      id,
      name: '',
    };
    const networkSubmitData = {
      id,
      name: 'to be determined',
    };
    if (!roles.isVmwareCloud) {
      networkData.vlan = formData.vlan;
      networkSubmitData.network = formData.vlan;
    }
    if (roles.isVmwareCloud) {
      networkData.network = formData.network;
      networkSubmitData.cloud_network = formData.network;
    }
    data.submitParams.networks.add.push(networkSubmitData);
    data.submitParams.networkIds.add.push(id);
    data.dataTable.networkAdapters.push(networkData);
  } else {
    // code for edit function
    const index = data.editingRow.id.substring(7);
    const networkData = { id: data.editingRow.id };
    const networkRows = data.dataTable.networkAdapters;
    if (!roles.isVmwareCloud) {
      networkData.network = formData.vlan;
      networkRows[index].old_vlan = networkRows[index].vlan;
      networkRows[index].vlan = formData.vlan;
    }
    if (roles.isVmwareCloud) {
      networkData.network = formData.network;
      networkRows[index].old_network = networkRows[index].network;
      networkRows[index].network = networkData.network;
    }
    networkData.name = networkRows[index].name;
    data.submitParams.networks.edit.push(networkData);
    data.submitParams.networkIds.edit.push(networkData.id);
    data.dataTable.networkAdapters = networkRows;
  }
  data.changeCounter += 1;
  setData({
    ...data,
    isLoading: false,
    form: {
      title: renderData.title,
      type: TYPES.RECONFIGURE,
      className: renderData.className,
    },
  });
};
