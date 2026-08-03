import { componentTypes } from '@@ddf';
import { dataTableHeaders, restructureOptions, socketChange } from './helper';
import { setDiskData } from './helpers/disk';
import { setNetworkData } from './helpers/network';
import { setDrivesData } from './helpers/drive';
import { TYPES } from './helpers/general';

const memoryField = () => ({
  component: 'switch',
  name: 'cb_memory',
  label: __('Memory'),
  onText: __('Yes'),
  offText: __('No'),
});

const memoryValueField = () => ({
  component: componentTypes.TEXT_FIELD,
  name: 'memory',
  label: __('Memory Size'),
  initialValue: 16,
  isRequired: true,
  condition: {
    when: 'cb_memory',
    is: true,
  },
  validate: [{ type: 'memoryCheck' }],
});

const memoryTypeField = (memory) => ({
  component: componentTypes.SELECT,
  id: 'memoryType',
  name: 'mem_type',
  label: __('Unit'),
  initialValue: 'GB',
  options: restructureOptions([__('GB'), __('MB')]),
  helperText: __(`Between ${memory.min}MB and ${memory.max / 1024}GB`),
  condition: {
    when: 'cb_memory',
    is: true,
  },
});

const memoryFormFields = (memory) => ({
  component: componentTypes.SUB_FORM,
  id: 'memory-sub-form',
  name: 'memory-sub-form',
  className: 'reconfigure-sub-form',
  condition: {
    when: 'cb_memory',
    is: true,
  },
  fields: [
    memoryValueField(),
    memoryTypeField(memory),
  ],
});

const processorField = () => ({
  component: 'switch',
  name: 'processor',
  label: __('Processor'),
  onText: __('Yes'),
  offText: __('No'),
});

const socketField = (data, setData, options) => ({
  component: componentTypes.SELECT,
  id: 'socket',
  name: 'socket_count',
  label: __('Sockets'),
  options: restructureOptions(options),
  hideField: options.length === 0,
  onChange: (value) => socketChange(value, data, setData, 'socket'),
  validate: [{ type: 'cpuCheck', field: 'socket' }],
});

const coresPerSocketField = (data, setData, options) => ({
  component: componentTypes.SELECT,
  id: 'cores',
  name: 'cores_per_socket_count',
  label: __('Cores Per Socket'),
  options: restructureOptions(options),
  onChange: (value) => socketChange(value, data, setData, 'cores'),
  validate: [{ type: 'cpuCheck', field: 'cores' }],
  hideField: options.length === 0,
});

const totalProcessorsField = (value) => ({
  component: componentTypes.TEXT_FIELD,
  id: 'total_cpus',
  name: 'total_cpus',
  label: __('Total Processors'),
  isReadOnly: true,
  type: 'number',
  initialValue: value,
});

const processorFormFields = (data, setData, options) => ({
  component: componentTypes.SUB_FORM,
  id: 'processor-sub-form',
  name: 'processor-sub-form',
  className: 'reconfigure-sub-form',
  condition: {
    when: 'processor',
    is: true,
  },
  fields: [
    socketField(data, setData, options.socket_options),
    coresPerSocketField(data, setData, options.cores_options),
    totalProcessorsField(data.socket * data.cores),
  ],
});

// IBM Power HMC — "Processor" toggle sub-form: Processing Units (float)
const ibmProcessorFormFields = () => ({
  component: componentTypes.SUB_FORM,
  id: 'ibm-processor-sub-form',
  name: 'ibm-processor-sub-form',
  className: 'reconfigure-sub-form',
  condition: {
    when: 'processor',
    is: true,
  },
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'processing_units',
      name: 'processing_units',
      label: __('Processing Units'),
      type: 'number',
      step: 0.01,
      min: 0.01,
      isRequired: true,
      helperText: __('Decimal value, e.g. 0.1, 0.2, 6.01'),
      validate: [{ type: 'required' }],
    },
  ],
});

// IBM Power HMC — "Virtual Processors" toggle (shared only, separate from Processor toggle)
const vprocsToggleField = () => ({
  component: 'switch',
  name: 'cb_vprocs',
  label: __('Virtual Processors'),
  onText: __('Yes'),
  offText: __('No'),
});

// IBM Power HMC — Virtual Processors sub-form: integer count
const ibmVprocsFormFields = () => ({
  component: componentTypes.SUB_FORM,
  id: 'ibm-vprocs-sub-form',
  name: 'ibm-vprocs-sub-form',
  className: 'reconfigure-sub-form',
  condition: {
    when: 'cb_vprocs',
    is: true,
  },
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'vprocs_count',
      name: 'vprocs_count',
      label: __('Virtual Processors'),
      type: 'number',
      step: 1,
      min: 1,
      isRequired: true,
      validate: [{ type: 'required' }],
    },
  ],
});

const diskTable = (data, roles, setData, onCellClick, buttonClick) => ({
  component: 'reconfigure-table',
  name: 'disk',
  label: __('Disks'),
  headers: dataTableHeaders('disk', roles),
  rows: data.dataTable.disks ? setDiskData(data.dataTable.disks, roles, data, setData) : [],
  onCellClick,
  formType: TYPES.DISK,
  addButtonLabel: __('Add Disk'),
  buttonClick,
  roleAllowed: roles.allowDiskChange,
});

const networkTable = (data, roles, setData, onCellClick, buttonClick) => ({
  component: 'reconfigure-table',
  name: 'network',
  label: __('Network Adapters'),
  headers: dataTableHeaders('network', roles),
  rows: data.dataTable.networkAdapters ? setNetworkData(data.dataTable.networkAdapters, roles, data, setData) : [],
  onCellClick,
  formType: TYPES.NETWORK,
  addButtonLabel: __('Add Network Adapter'),
  buttonClick,
  roleAllowed: roles.allowNetworkChange,
});

const driveTable = (data, roles, setData, onCellClick) => ({
  component: 'reconfigure-table',
  name: 'drive',
  label: __('CD/DVD Drives'),
  headers: dataTableHeaders('drive', roles),
  rows: data.dataTable.drives ? setDrivesData(data.dataTable.drives, data) : [],
  onCellClick,
  addButton: false,
  formType: TYPES.DRIVE,
  hideField: !data.dataTable.drives || data.dataTable.drives.length === 0,
  roleAllowed: roles.allowCdromsChange,
});

const renderDatatables = (recordId, data, roles, setData, onCellClick, buttonClick) => [diskTable(data, roles, setData, onCellClick, buttonClick),
  networkTable(data, roles, setData, onCellClick, buttonClick),
  driveTable(data, roles, setData, onCellClick)];

export const reconfigureFormFields = (recordId, roles, memory, data, setData, options, onCellClick, buttonClick) => {
  const formFields = [];
  if (roles.allowMemoryChange) {
    formFields.push(memoryField());
    formFields.push(memoryFormFields(roles));
  }
  if (roles.allowCpuChange) {
    if (roles.isIbmPowerHmc) {
      // IBM: "Processor" toggle → Processing Units field
      formFields.push(processorField());
      formFields.push(ibmProcessorFormFields());
      if (roles.isSharedProcessor) {
        // IBM shared only: separate "Virtual Processors" toggle → vprocs count field
        formFields.push(vprocsToggleField());
        formFields.push(ibmVprocsFormFields());
      }
    } else {
      // All other VMs (VMware, RHV, etc.): Sockets / Cores
      formFields.push(processorField());
      formFields.push(processorFormFields(data, setData, options, memory.max_cpu));
    }
  }
  if (recordId.length === 1) {
    formFields.push(renderDatatables(recordId, data, roles, setData, onCellClick, buttonClick));
  }
  return formFields;
};
