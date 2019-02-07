import { componentTypes } from '@data-driven-forms/react-form-renderer';

const createSchema = (options = []) => ({
  fields: [{
    component: componentTypes.SELECT,
    name: 'server_id',
    id: 'server_id',
    label: __('Select Server:'),
    placeholder: `<${__('Not a Server')}>`,
    isClearable: true,
    options: options.sort((a, b) => b.label.localeCompare(a.label)),
  }],
});

export default createSchema;
