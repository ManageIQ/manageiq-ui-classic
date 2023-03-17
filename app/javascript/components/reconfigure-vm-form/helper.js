import { http } from '../../http_api';
import {
  deleteDisk,
  cancelDeleteDisk,
  cancelResizeDisk,
  getDiskTableHeaders,
  setDiskFormSubmit,
  formatDiskData,
} from './helpers/disk';
import {
  cancelEditNetwork,
  deleteNetwork,
  cancelDeleteNetwork,
  getNetworkTableHeaders,
  setNetworkFormSubmit,
} from './helpers/network';
import {
  getDriveTableHeaders,
  cancelConnectDrives,
  setDriveFormSubmit,
  cancelDisconnectDrives,
  disconnectDrives,
} from './helpers/drive';
import { TYPES, formsData, sizeInMB } from './helpers/general';

/** Function to check if an item is array. if yes, returns true, else returns false */
const isArray = (item) => Array.isArray(item);

/** Function to get the options.
 * The data is either array of strings eg: ['aaa','bbb'] or
 * array of string arrays eg: [['aaa','bbb], ['ccc','ddd']] */
export const restructureOptions = (data) => {
  if (!data) { return []; } return data.map((item) => (
    isArray(item)
      ? ({ label: item[0], value: item[1] })
      : ({ label: item.toString(), value: item })));
};

/** Function to set the submit button status based on change counters */
export const getFormSubmitStatus = (data) => {
  if (data.form.type === TYPES.RECONFIGURE && data.changeCounter > 0) {
    return true;
  }
  return false;
};

/** Function to execute all button actions */
export const setButtonActions = (item, data, setData, roles) => {
  switch (item.callbackAction) {
    case 'deleteDisk': deleteDisk(item, data, setData); break;
    case 'cancelDeleteDisk': cancelDeleteDisk(item, data, setData); break;
    case 'cancelEditNetwork': cancelEditNetwork(item, data, setData, roles); break;
    case 'deleteNetwork': deleteNetwork(item, data, setData, roles); break;
    case 'cancelDeleteNetwork': cancelDeleteNetwork(item, data, setData); break;
    case 'cancelConnectDrives': cancelConnectDrives(item, data, setData); break;
    case 'cancelResizeDisk': cancelResizeDisk(item, data, setData); break;
    case 'cancelDisconnectDrives': cancelDisconnectDrives(item, data, setData); break;
    case 'disconnectDrives': disconnectDrives(item, data, setData); break;
    default: return true;
  }
  return true;
};

/** Function to load the datatable headers values  */
export const dataTableHeaders = (table, roles) => {
  switch (table) {
    case 'network':
      return getNetworkTableHeaders(roles);
    case 'drive':
      return getDriveTableHeaders();
    default:
      return getDiskTableHeaders(roles);
  }
};

/** validate the memory size field.
 * return false when the validation fails
 */
export const validateMemory = (value, checkValue, unit, limit) => {
  if (checkValue) {
    const valueInMB = sizeInMB(value, unit);
    const remainder = valueInMB % 4;
    if (valueInMB < limit.min || valueInMB > limit.max || remainder !== 0) {
      return false;
    }
  }
  return true;
};

/** validate the memory size field.
 * return false when the validation fails
 */
export const validateCpu = (value, allValues, field, limit) => {
  const cpuValue = field === 'socket' ? allValues.cores_per_socket_count : allValues.socket_count;
  if ((cpuValue * value) > limit) {
    return false;
  }

  return true;
};

/** Setting up the sub forms submit data when the form submit action gets called */
export const subFormSubmit = (data, setData, formData, roles) => {
  switch (data.form.type) {
    case TYPES.DISK:
    case TYPES.RESIZE:
      setDiskFormSubmit(data, setData, formData, roles, formsData.reconfigure);
      break;
    case TYPES.NETWORK:
    case TYPES.EDITNETWORK:
      setNetworkFormSubmit(data, setData, formData, roles, formsData.reconfigure);
      break;
    case TYPES.DRIVE:
      setDriveFormSubmit(data, setData, formData, formsData.reconfigure);
      break;
    default:
      break;
  }
};

/** Setting up the final reconfigure submit data when the form submit button clicked */
export const reconfigureSubmitData = (recordId, data, formData) => ({
  objectIds: recordId,
  cb_memory: formData.cb_memory,
  cb_cpu: formData.processor,
  memory: formData.memory,
  memory_type: formData.mem_type,
  socket_count: formData.socket_count,
  cores_per_socket_count: formData.cores_per_socket_count,
  vmAddDisks: data.submitParams.disks.add || [],
  vmRemoveDisks: data.submitParams.disks.delete || [],
  vmResizeDisks: data.submitParams.disks.resize || [],
  vmAddNetworkAdapters: data.submitParams.networks.add || [],
  vmRemoveNetworkAdapters: data.submitParams.networks.delete || [],
  vmEditNetworkAdapters: data.submitParams.networks.edit || [],
  vmConnectCDRoms: data.submitParams.drives.connect || [],
  vmDisconnectCDRoms: data.submitParams.drives.disconnect || [],
});

/** function to save the processor field changes to show total processors */
export const socketChange = (value, data, setData, field) => {
  if (data[field] !== value) {
    data[field] = value;
    data.initialValues.total_cpus = data.socket * data.cores;
    setData({
      ...data,
    });
  }
};

/** Setting up the reconfigure form details when the form loads
 * TODO: replace with API endpoints.
*/
export const setInitialData = (value, requestId, data, setData) => {
  http.get(`/vm_infra/reconfigure_form_fields/${requestId},${value}`).then((response) => {
    setData({
      ...data,
      initialValues: {
        processor: response.cb_cpu,
        cb_memory: response.cb_memory,
        cores_per_socket_count: response.cores_per_socket_count,
        memory: response.memory,
        mem_type: response.memory_type,
        socket_count: response.socket_count,
      },
      socket: response.socket_count,
      cores: response.cores_per_socket_count,
      orchestration_stack_id: response.orchestration_stack_id,
      isLoading: false,
      dataTable: {
        ...data.dataTable,
        disks: formatDiskData(response.disks),
        networkAdapters: response.network_adapters,
        drives: response.cdroms,
      },
    });
  });
};
