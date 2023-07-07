import { componentTypes, validatorTypes } from '@@ddf';
import { restructureOptions } from './helper';
import { getCellData } from './helpers/general';

const vlanField = (options, roles, data) => ({
  component: componentTypes.SELECT,
  id: 'vlan',
  name: 'vlan',
  label: __('vLan'),
  options: restructureOptions(options),
  isRequired: true,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  initialValue: data.form.action === 'edit' ? getCellData(data.editingRow, 'vlan') : '',
  hideField: roles.isVmwareCloud,
  validate: [{ type: 'customRequired', hideField: roles.isVmwareCloud }],
});

const networkField = (options, roles, data) => ({
  component: componentTypes.SELECT,
  id: 'network',
  name: 'network',
  label: __('Network'),
  options: restructureOptions(options),
  isRequired: true,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  initialValue: data.form.action === 'edit' ? getCellData(data.editingRow, 'network') : '',
  hideField: !roles.isVmwareCloud,
  validate: [{ type: 'customRequired', hideField: !roles.isVmwareCloud }],
});

const nameField = (data, options, roles) => {
  if (roles.isVmwareCloud && data.form.action === 'add') {
    return {
      component: componentTypes.SELECT,
      id: 'network',
      name: 'network',
      label: __('Network'),
      options: restructureOptions(options),
      isRequired: true,
      placeholder: __('<Choose>'),
      initialValue: data.form.action === 'edit' ? getCellData(data.editingRow, 'name') : '',
      includeEmpty: true,
      hideField: !roles.isVmwareCloud,
      validate: [{ type: validatorTypes.REQUIRED }],
    };
  }
  return {
    component: componentTypes.TEXT_FIELD,
    id: 'name',
    name: 'name',
    label: __('Name'),
    isReadOnly: data.form.action === 'edit',
    autoFocus: true,
    initialValue: data.form.action === 'edit' ? getCellData(data.editingRow, 'name') : '',
    hideField: data.form.action === 'add',
  };
};

const macField = (data) => ({
  component: componentTypes.TEXT_FIELD,
  id: 'mac',
  name: 'mac',
  label: __('MAC Address'),
  initialValue: data.form.action === 'edit' ? getCellData(data.editingRow, 'mac') : '',
  isReadOnly: data.form.action === 'edit',
  hideField: data.form.action === 'add',
});

export const networkFormFields = (data, options, roles) => ([
  nameField(data, options.avail_adapter_names, roles),
  vlanField(options.vlan_options, roles, data),
  networkField(data.networkOptions, roles, data),
  macField(data),
]);
