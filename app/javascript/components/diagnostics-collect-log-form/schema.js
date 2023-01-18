import { componentTypes } from '@@ddf';

const createSchema = (initialData, options) => {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: sprintf(__(`Editing Log Depot Settings for %s: %s`), initialData.logType, initialData.displayName),
    id: 'log-depot-settings',
    name: 'log-depot-settings',
    fields: [{
      component: componentTypes.SELECT,
      id: 'log_protocol',
      name: 'log_protocol',
      label: __('Type'),
      placeholder: `<${__('Choose')}>`,
      validateOnMount: true,
      options,
    }],
  },
  ];
  return { fields };
};

export default createSchema;
