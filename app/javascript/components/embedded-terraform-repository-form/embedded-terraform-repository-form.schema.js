import { componentTypes, validatorTypes } from '@@ddf';
import { customUrlValidator } from '../workflow-repository-form/helpers';

const getCredentials = () => API.get(
  // eslint-disable-next-line max-len
  '/api/authentications?collection_class=ManageIQ::Providers::EmbeddedTerraform::AutomationManager::ScmCredential&expand=resources&sort_by=name&sort_order=ascending'
).then(({ resources }) => resources.map(({
  id, name,
}) => ({
  label: __(name),
  value: id,
})));

function createSchema(repositoryId) {
  const fields = [
    {
      component: componentTypes.TEXT_FIELD,
      label: __('Name'),
      maxLength: 128,
      id: 'name',
      name: 'name',
      isRequired: true,
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
    },
    {
      component: componentTypes.TEXT_FIELD,
      label: __('Description'),
      maxLength: 128,
      id: 'description',
      name: 'description',
    },
    {
      component: componentTypes.TEXT_FIELD,
      label: __('URL'),
      maxLength: 128,
      id: 'scm_url',
      name: 'scm_url',
      isRequired: true,
      validate: [
        (value) => (customUrlValidator(value)
          ? undefined
          // eslint-disable-next-line max-len
          : 'URL must include a protocol (http://, https:// or file://) with path or be a valid SSH path (user@server:path or ssh://user@address:port/path)'),
      ],
    },
    {
      component: componentTypes.CHECKBOX,
      label: __('Verify SSL'),
      name: 'verify_ssl',
      id: 'verify_ssl',
    },
    {
      component: componentTypes.SELECT,
      id: 'authentication_id',
      name: 'authentication_id',
      label: __('SCM Credentials'),
      placeholder: __('Select credentials'),
      includeEmpty: true,
      loadOptions: getCredentials,
    },
    ...(repositoryId ? [
      {
        component: componentTypes.TEXT_FIELD,
        label: __('SCM Branch'),
        maxLength: 128,
        id: 'scm_branch',
        name: 'scm_branch',
        isRequired: true,
        validate: [{
          type: validatorTypes.REQUIRED,
          message: __('Required'),
        }],
      },
    ] : [{
      component: componentTypes.TEXT_FIELD,
      label: __('SCM Branch'),
      maxLength: 128,
      id: 'scm_branch',
      name: 'scm_branch',
    }]),
  ];
  return { fields };
}

export default createSchema;
