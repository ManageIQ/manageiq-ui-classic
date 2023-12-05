import { componentTypes, validatorTypes } from '@@ddf';
import { restructureOptions } from './helper';
import { TYPES, getCellData, getObjectData } from './helpers/general';

const getSwitchData = (row, field) => (getCellData(row, field) === 'Yes');

const nameField = (data) => ({
  component: componentTypes.TEXT_FIELD,
  id: 'name',
  name: 'name',
  label: __('Name'),
  isReadOnly: true,
  initialValue: data.form.action === TYPES.RESIZE ? getCellData(data.editingRow, 'name') : '',
  hideField: data.form.action === 'add',
});

const sizeField = (data) => ({
  component: componentTypes.TEXT_FIELD,
  id: 'size',
  name: 'size',
  label: __('Size'),
  isRequired: true,
  initialValue: data.form.action === TYPES.RESIZE ? getCellData(data.editingRow, 'size') : '',
  validate: [
    {
      type: 'diskMemoryCheck',
      size: data.form.action === TYPES.RESIZE ? Number(getObjectData(data.editingRow.id.substring(4), data.dataTable.disks, 'orgHdSize')) + 1 : 1,
      unit: data.form.action === TYPES.RESIZE ? getObjectData(data.editingRow.id.substring(4), data.dataTable.disks, 'orgHdUnit') : __('MB'),
    },
  ],
});

const unitField = (data) => ({
  component: componentTypes.SELECT,
  id: 'unit',
  name: 'unit',
  label: __('Unit'),
  initialValue: data.form.action === TYPES.RESIZE ? getCellData(data.editingRow, 'unit') : __('GB'),
  options: restructureOptions([__('GB'), __('MB')]),
});

const typeField = (data) => ({
  component: componentTypes.SELECT,
  id: 'type',
  name: 'type',
  label: __('Type'),
  autoFocus: true,
  options: restructureOptions(['thin', 'thick']),
  validate: [{ type: validatorTypes.REQUIRED }],
  isReadOnly: data.form.action !== 'add',
  isRequired: true,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  disabled: data.form.action === TYPES.RESIZE,
  initialValue: data.form.action === TYPES.RESIZE ? getCellData(data.editingRow, 'type') : '',
});

const modeField = (data, roles) => ({
  component: componentTypes.SELECT,
  id: 'mode',
  name: 'mode',
  label: __('Mode'),
  options: restructureOptions(['persistent', 'nonpersistent']),
  isReadOnly: data.form.action !== 'add',
  hideField: !roles.isVmwareInfra,
  isRequired: true,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  disabled: data.form.action === TYPES.RESIZE,
  validate: [{ type: 'customRequired', hideField: !roles.isVmwareInfra }],
  initialValue: data.form.action === TYPES.RESIZE ? getCellData(data.editingRow, 'mode') : '',
});

const controllerField = (data, roles, options) => ({
  component: componentTypes.SELECT,
  id: 'controller',
  name: 'controller',
  label: __('Controller'),
  options: restructureOptions(options),
  isReadOnly: data.form.action !== 'add',
  hideField: !roles.isVmwareInfra,
  disabled: data.form.action === TYPES.RESIZE,
  initialValue: data.form.action === TYPES.RESIZE ? getCellData(data.editingRow, 'controller') : '',
});

const dependentField = (data, roles) => ({
  component: 'switch',
  id: 'dependent',
  name: 'dependent',
  label: __('Dependent'),
  onText: __('Yes'),
  offText: __('No'),
  hideField: !roles.isVmwareInfra,
  disabled: data.form.action === TYPES.RESIZE,
  initialValue: data.form.action === TYPES.RESIZE ? getSwitchData(data.editingRow, 'dependent') : '',
});

const bootableField = (data, roles) => ({
  component: 'switch',
  name: 'bootable',
  label: __('Bootable'),
  onText: __('Yes'),
  offText: __('No'),
  isReadOnly: data.form.action !== 'add',
  hideField: !roles.isRedhat,
  initialValue: data.form.action === TYPES.RESIZE ? getSwitchData(data.editingRow, 'bootable') : false,
});

export const diskFormFields = (data, roles, options, memory) => ([
  nameField(data),
  typeField(data),
  sizeField(data),
  unitField(data, memory),
  modeField(data, roles),
  controllerField(data, roles, options.controller_types),
  dependentField(data, roles),
  bootableField(data, roles),
]);
