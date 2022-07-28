import { componentTypes } from '@@ddf';
import { createOptions } from './helper';

export const webserviceSchema = ({ webservices }) => ({
  component: componentTypes.SUB_FORM,
  id: 'webservices',
  name: 'webeservices',
  title: __('Web Services'),
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'webservicesMode',
      name: 'webservices.mode.value',
      label: __('Mode'),
      placeholder: __('<Choose>'),
      options: createOptions(webservices.mode.options),
    },
    {
      component: componentTypes.SELECT,
      id: 'webservicesSecurity',
      name: 'webservices.security.value',
      label: __('Security'),
      placeholder: __('<Choose>'),
      options: createOptions(webservices.security.options),
    },
  ],
});
