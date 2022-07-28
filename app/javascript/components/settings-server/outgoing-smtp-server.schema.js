import { componentTypes } from '@@ddf';
import { createOptions } from './helper';

export const outgoingSmtpSchema = ({ smtp }) => ({
  component: componentTypes.SUB_FORM,
  id: 'smpt',
  name: 'smpt',
  title: __('Outgoing SMTP E-mail Server'),
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'smtpHost',
      name: 'smtp.host.value',
      label: __('Host'),
      maxLength: 128,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'smtpPort',
      name: 'smtp.port.value',
      label: __('Port'),
      maxLength: 128,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'smtpDomain',
      name: 'smtp.domain.value',
      label: __('Domain'),
      maxLength: 128,
    },
    {
      component: componentTypes.SWITCH,
      label: __('Start TLS Automatically'),
      name: 'smtp.enable_starttls_auto.value',
      initialValue: smtp.enable_starttls_auto.checked,
    },
    {
      component: componentTypes.SELECT,
      id: 'smtpSslVerifyMode',
      name: 'smtp.sslVerifyMode.value',
      label: __('SSL verify Mode'),
      placeholder: __('<Choose>'),
      options: createOptions(smtp.ssl_verify_mode.options),
    },
    {
      component: componentTypes.SELECT,
      id: 'smtpAuthentication',
      name: 'smtp.authentication.value',
      label: __('Authentication'),
      placeholder: __('<Choose>'),
      options: createOptions(smtp.authentication.options),
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'smtpUsername',
      name: 'smtp.username.value',
      label: __('Username'),
      maxLength: 128,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'smtpPassword',
      name: 'smtp.password.value',
      label: __('Password'),
      maxLength: 128,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'smtpFromEmail',
      name: 'smtp.from_email.value',
      label: __('From E-Mail Address'),
      maxLength: 128,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'smtpTestEmail',
      name: 'smtp.test_email.value',
      label: __('Test E-Mail Address'),
      maxLength: 128,
    },
    {
      component: componentTypes.SWITCH,
      label: __('Verify'),
      name: 'smtp.verify',
      initialValue: true,
    }
  ],
});
