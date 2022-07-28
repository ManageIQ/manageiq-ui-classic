import { componentTypes } from '@@ddf';
import { createOptions } from './helper';

export const loggingSchema = ({ logging }) => ({
  component: componentTypes.SUB_FORM,
  id: 'logging',
  name: 'logging',
  title: __('Logging'),
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'logLevel',
      name: 'logging.level.value',
      label: __('Log Level'),
      placeholder: __('<Choose>'),
      options: createOptions(logging.level.options),
    },
  ]
});
