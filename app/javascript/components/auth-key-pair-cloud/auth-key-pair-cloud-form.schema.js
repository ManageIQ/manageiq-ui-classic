import { componentTypes, validatorTypes } from '@@ddf';

const providerOptions = () =>
  API.get('/api/providers?expand=resources&attributes=id,name,supports_auth_key_pair_create&filter[]=supports_auth_key_pair_create=true')
    .then(({ resources }) => resources.map(({ id, name }) => ({ value: id, label: name })));

const createSchema = () => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      label: __('Name'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    }, {
      component: componentTypes.TEXTAREA,
      id: 'public_key',
      name: 'public_key',
      label: __('Public Key'),
      rows: 10,
    },
    {
      component: componentTypes.SELECT,
      id: 'ems_id',
      name: 'ems_id',
      label: __('Provider'),
      placeholder: `<${__('Choose')}>`,
      loadOptions: providerOptions,
      isRequired: true,
      includeEmpty: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
  ],
});

export default createSchema;
