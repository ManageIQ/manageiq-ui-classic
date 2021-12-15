/* eslint-disable no-restricted-syntax */
import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

let showError = false;

function changeValue(value, loadSchema, emptySchema) {
  if (value === '-1') {
    emptySchema();
    showError = true;
  } else {
    API.options(`/api/floating_ips?ems_id=${value}`).then(loadSchema(), value);
    showError = false;
  }
}

function createSchema(ems, recordId, loadSchema, emptySchema, providerFields = []) {
  const providers = ems.filter((tenant) => tenant.type !== 'ManageIQ::Providers::Nuage::NetworkManager');

  const fields = [
    {
      component: componentTypes.SUB_FORM,
      title: __('Network Management Provider'),
      id: 'network-management-provider',
      name: 'network-management-provider',
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'ems_id',
          name: 'ems_id',
          label: __('Network Manager'),
          isDisabled: !!recordId,
          includeEmpty: true,
          validateOnMount: true,
          onChange: (value) => changeValue(value, loadSchema, emptySchema),
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
          options: providers.map(({ id, name }) => ({ label: name, value: id })),
        },
      ],
    },
    ...(showError ? [
      {
        id: 'networkWarning',
        component: componentTypes.PLAIN_TEXT,
        name: 'networkWarning',
        label: __('Please select a network manager.'),
      },
    ] : []),
    ...providerFields,
  ];
  return { fields };
}

export default createSchema;
