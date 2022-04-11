import { componentTypes, validatorTypes } from '@@ddf';

// eslint-disable-next-line max-len
const url = '/api/providers?expand=resources&attributes=id,name,supports_cloud_object_store_container_create&filter[]=supports_cloud_object_store_container_create=true';
const loadStorageManagers = () => API.get(url).then(({ resources }) => {
  let storageManagerOptions = [];
  storageManagerOptions = resources.map(({ id, name }) => ({ label: name, value: id }));
  storageManagerOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
  return storageManagerOptions;
});

const changeValue = (value, loadSchema, emptySchema) => {
  if (value === '-1') {
    emptySchema();
  } else {
    miqSparkleOn();
    API.options(`/api/cloud_object_store_containers?ems_id=${value}`).then(loadSchema());
  }
};

function createSchema(providerFields = [], loadSchema, emptySchema) {
  const fields = [
    {
      component: componentTypes.SELECT,
      id: 'storage_manager_id',
      name: 'storage_manager_id',
      label: __('Storage Manager'),
      validate: [{ type: validatorTypes.REQUIRED }],
      onChange: (value) => changeValue(value, loadSchema, emptySchema),
      isRequired: true,
      loadOptions: loadStorageManagers,
    },
    ...providerFields,
  ];
  return { fields };
}

export default createSchema;
