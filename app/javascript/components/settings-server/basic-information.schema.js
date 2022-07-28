import { componentTypes } from '@@ddf';

export const basicInformatinoSchema = ({ basic }) => ({
  component: componentTypes.SUB_FORM,
  id: 'basicInformation',
  name: 'basicInformation',
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'server_company',
      name: 'basic.companyName',
      label: __('Company Name'),
      maxLength: 128,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'server_name',
      name: 'basic.applianceName',
      label: __('Appliance Name'),
      maxLength: 128,
    },
    {
      component: componentTypes.SELECT,
      id: 'server_zone',
      name: 'basic.zone.value',
      label: __('Zone'),
      placeholder: __('<Choose>'),
      options: basic.zone.options,
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'server_zone',
      name: 'basic.applianceTimeZone.value',
      label: __('Appliance Time Zone'),
      placeholder: __('<Choose>'),
      options: basic.applianceTimeZone.options,
    },
    {
      component: componentTypes.SELECT,
      id: 'default_local',
      name: 'basic.defaultLocal.value',
      label: __('Default Locale'),
      placeholder: __('<Choose>'),
      options: basic.defaultLocal.options,
    },
  ],
});
