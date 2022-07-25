import { componentTypes, validatorTypes } from '@@ddf';

const providerUrl = '/api/providers?expand=resources&attributes=id,name,supports_cloud_database_create,type&filter[]=supports_cloud_database_create=true';
const loadProviders = () => API.get(providerUrl)
.then(({ resources }) => {
  let providerOptions = [];
  providerOptions = resources.map(({ id, name }) => ({ label: name, value: id }));
  providerOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
  return providerOptions;
});

const changeValue = (value, loadSchema, emptySchema) => {
  if (value === '-1') {
    emptySchema();
  } else {
    miqSparkleOn();
    API.options(`/api/cloud_databases?ems_id=${value}`).then(loadSchema()).then(miqSparkleOff);
  }
};

const createSchema = (isEdit, fields, emptySchema, loadSchema) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'ems_id',
      name: 'ems_id',
      label: __('Cloud Provider'),
      validate: [{ type: validatorTypes.REQUIRED }],
      onChange: (value) => changeValue(value, loadSchema, emptySchema),
      isRequired: true,
      isDisabled: isEdit,
      loadOptions: loadProviders,
    },
    ...(fields ? fields : []),
  ],
});

export default createSchema;
