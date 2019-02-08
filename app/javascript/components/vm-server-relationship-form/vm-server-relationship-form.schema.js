import { componentTypes } from '@data-driven-forms/react-form-renderer';

const createSchema = (options = []) => ({
  fields: [{
    component: componentTypes.SELECT,
    name: 'serverId',
    id: 'serverId',
    label: __('Select Server:'),
    placeholder: `<${__('Not a Server')}>`,
    options,
  }],
});

export default createSchema;
