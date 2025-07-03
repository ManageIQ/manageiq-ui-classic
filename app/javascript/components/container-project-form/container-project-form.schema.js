import { componentTypes, validatorTypes } from '@@ddf';

// Load container managers that support container projects
const providerUrl = '/api/providers?expand=resources&attributes=id,name,type&filter[]=type=ManageIQ::Providers::Openshift::ContainerManager';
const loadProviders = () => API.get(providerUrl).then(({ resources }) =>
  resources.map(({ id, name }) => ({ label: name, value: id }))
).catch((error) => {
  console.error('Error loading providers:', error);
  return [];
});

// Validation for container project name (Kubernetes naming rules)
const validateProjectName = {
  type: validatorTypes.PATTERN,
  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
  message: __('Name must consist of lower case alphanumeric characters or \'-\', start with an alphanumeric character, and end with an alphanumeric character'),
};

const validateProjectNameLength = {
  type: validatorTypes.MAX_LENGTH,
  threshold: 63,
  message: __('Name must be no more than 63 characters'),
};

const createSchema = (emsId, setState) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      validate: [
        { type: validatorTypes.REQUIRED },
        validateProjectName,
        validateProjectNameLength,
      ],
      isRequired: true,
      label: __('Container Project Name'),
      maxLength: 63,
      helperText: __('Must be lowercase alphanumeric with hyphens, start and end with alphanumeric'),
    },
    {
      component: componentTypes.SELECT,
      id: 'ems_id',
      name: 'ems_id',
      label: __('Container Provider'),
      validate: [{ type: validatorTypes.REQUIRED }],
      onChange: (emsId) => setState((state) => ({ ...state, emsId })),
      isRequired: true,
      includeEmpty: true,
      loadOptions: loadProviders,
      helperText: __('Select the container management provider'),
    },
  ],
});

export default createSchema;
