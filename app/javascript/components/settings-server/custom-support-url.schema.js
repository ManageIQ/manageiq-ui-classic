import { componentTypes } from '@@ddf';

export const customSupportUrl = ({ customSupportUrl }) => ({
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
      id: 'smtpHost',
      name: 'smtp.host.value',
      label: __('Host'),
      maxLength: 128,
    },
  ],
});
