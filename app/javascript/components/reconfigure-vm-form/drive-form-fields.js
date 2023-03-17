import { componentTypes, validatorTypes } from '@@ddf';
import { restructureOptions } from './helper';
import { getCellData } from './helpers/general';

const nameField = (data) => ({
  component: componentTypes.TEXT_FIELD,
  id: 'name',
  name: 'name',
  label: __('Name'),
  initialValue: getCellData(data.editingRow, 'name'),
  autoFocus: true,
  isReadOnly: true,
});

const hostField = (data, options) => ({
  component: componentTypes.SELECT,
  id: 'host_file',
  name: 'host_file',
  label: __('Host File'),
  options: restructureOptions(options),
  validate: [{ type: validatorTypes.REQUIRED }],
  isRequired: true,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  initialValue: getCellData(data.editingRow, 'hostFile'),
});

export const driveFormFields = (data, options) => ([
  nameField(data),
  hostField(data, options.host_file_options),
]);
