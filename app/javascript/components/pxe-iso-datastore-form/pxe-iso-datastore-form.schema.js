import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = () => {
  return ({
    fields: [
      {
        component: componentTypes.SELECT,
        name: 'ems_id',
        id: 'ems_id',
        label: __('Provider'),
        placeholder: __('<Choose>'),
        includeEmpty: true,
        loadOptions: () => API.get('/api/providers?expand=resources&collection_class=ManageIQ::Providers::Redhat::InfraManager').then(({ resources }) => {
          return resources.map(({ id, name }) => ({ value: id + " " + name, label: name }));
        }),
        validate: [{ type: validatorTypes.REQUIRED }],
      },
    ],
  });
};

export default createSchema;