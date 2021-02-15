import { componentTypes, validatorTypes } from '@@ddf';

const providerUrl = '/api/providers?expand=resources&attributes=id,name,supports_cloud_tenants&filter[]=supports_cloud_tenants=true';
const loadProviders = () => API.get(providerUrl).then(({ resources }) => resources.map(({ id, name }) => ({ label: name, value: id })));

const tenantUrl = (emsId) => `/api/cloud_tenants?attributes=id,name,ext_management_system.name&expand=resources&filter[]=ems_id=${emsId}`;
const loadTenants = (emsId) => API.get(tenantUrl(emsId)).then(({ resources }) => resources.map(({
  id, name, ext_management_system: { name: emsName },
}) => ({
  label: `${emsName} (${name})`,
  value: id,
})));

const createSchema = (edit, emsId, setState) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
      label: __('Tenant Name'),
      maxLength: 128,
    },
    ...(!edit ? [
      {
        component: componentTypes.SELECT,
        id: 'ems_id',
        name: 'ems_id',
        label: __('Cloud Provider'),
        validate: [{ type: validatorTypes.REQUIRED }],
        onChange: (emsId) => setState((state) => ({ ...state, emsId })),
        isRequired: true,
        includeEmpty: true,
        loadOptions: loadProviders,
      },
      {
        component: componentTypes.SELECT,
        id: 'parent_id',
        name: 'parent_id',
        key: `parent_id-${emsId}`,
        label: __('Parent Cloud Tenant'),
        loadOptions: () => (emsId ? loadTenants(emsId) : Promise.resolve([])),
        condition: {
          when: 'ems_id',
          isNotEmpty: true,
        },
      },
    ] : []),
  ],
});

export default createSchema;
