import { componentTypes } from '@@ddf';
import amazonAuthenticationSchema from './amazon-authentication-schema';
import externalAuthenticationSchema from './external-authentication-schema';

const hours = () => [...Array(25).keys()].map((hour) => ({ label: hour.toString(), value: hour }));

const minutes = () => [...Array(12).keys()].map((min) => {
  const minute = min * 5;
  return ({ label: minute.toString(), value: minute });
});

const modes = () => [
  { label: __('Database'), value: 'database' },
  { label: __('Amazon'), value: 'amazon' },
  { label: __('External (httpd)'), value: 'httpd' },
];

const sessionTimeout = () => [
  {
    component: componentTypes.SUB_FORM,
    id: 'sessionTimeoutOuter',
    name: 'sessionTimeoutOuter',
    title: __('Session Timeout'),
    fields: [
      {
        component: componentTypes.SUB_FORM,
        id: 'sessionTimeoutInner',
        name: 'sessionTimeoutInner',
        className: 'sessionTimeoutInnerWrapper settingAuthenticationRow',
        fields: [
          {
            component: componentTypes.SELECT,
            id: 'session_timeout_hours',
            name: 'session_timeout_hours',
            options: hours(),
            label: __('Hours'),
          },
          {
            component: componentTypes.SELECT,
            id: 'session_timeout_mins',
            name: 'session_timeout_mins',
            options: minutes(),
            label: __('Minutes'),
          },
        ],
      },
    ],
  },
];

const mode = () => ({
  component: componentTypes.SELECT,
  id: 'authentication_mode',
  name: 'mode',
  options: modes(),
  label: __('Mode'),
});

const createSchema = () => {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      id: 'settingsAuthentication',
      name: 'settingsAuthentication',
      className: 'settingsAuthenticationWrapper',
      title: __('Authentication'),
      fields: [
        sessionTimeout(),
        mode(),
        amazonAuthenticationSchema('amazon'),
        externalAuthenticationSchema('httpd'),
      ],
    },
  ];
  return { fields };
};

export default createSchema;
