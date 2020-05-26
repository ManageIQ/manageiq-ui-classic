import { componentTypes } from '@@ddf';

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
