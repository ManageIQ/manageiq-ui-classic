import { componentTypes } from '@@ddf';

const createSchema = (promise) => ({
  fields: [{
    component: componentTypes.SELECT,
    name: 'serverId',
    id: 'serverId',
    label: __('Select Server:'),
    placeholder: `<${__('Not a Server')}>`,
    loadOptions: () => promise.then(({ resources }) => resources.map(({ id, name }) => ({ label: name, value: id }))),
  }],
});

export default createSchema;
