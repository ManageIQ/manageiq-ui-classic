import { componentTypes, validatorTypes } from '@@ddf';

const basicInformatinoSchema = (initialValues) => ({
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
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'server_name',
      name: 'basic.applianceName',
      label: __('Appliance Name'),
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'server_zone',
      name: 'basic.zone.value',
      label: __('Zone'),
      placeholder: __('<Choose>'),
      options: initialValues.basic.zone.options,
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'server_zone',
      name: 'basic.applianceTimeZone.value',
      label: __('Appliance Time Zone'),
      placeholder: __('<Choose>'),
      options: initialValues.basic.applianceTimeZone.options,
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'default_local',
      name: 'basic.defaultLocal.value',
      label: __('Default Locale'),
      placeholder: __('<Choose>'),
      options: initialValues.basic.defaultLocal.options,
      isRequired: true,
    },
  ],
});

const serverControlsList = (initialValues) => {
  const a = initialValues.serverControls[0].value.map((item) => ({
    component: componentTypes.SWITCH,
    label: item.label,
    name: item.name,
    initialValue: item.checked,
  }));
  console.log(a);
  return a;
};

const serverControlsSchema = (initialValues) => ({
  component: componentTypes.SUB_FORM,
  id: 'serverControls',
  name: 'serverControls',
  title: __('Server Controls'),
  fields: serverControlsList(initialValues),
});

const createSchema = (initialValues) => ({
  fields: [
    basicInformatinoSchema(initialValues),
    serverControlsSchema(initialValues),
  ],
});

export default createSchema;
