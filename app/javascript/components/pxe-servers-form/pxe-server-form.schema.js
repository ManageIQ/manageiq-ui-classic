import { componentTypes, validatorTypes } from '@@ddf';
import debouncePromise from '../../helpers/promise-debounce';
import { http, API } from '../../http_api';

export const asyncValidator = (value, serverId) =>
  API.get(`/api/pxe_servers?expand=resources&filter[]=name='${value ? value.replace('%', '%25') : ''}'`)
    .then((json) => {
      if (json.resources.find(({ id, name }) => name === value && id !== serverId)) {
        return __('Name has already been taken');
      }
      if (value === '' || value === undefined) {
        return __('Required');
      }
      return undefined;
    });

const asyncValidatorDebounced = debouncePromise(asyncValidator);

const basicInformationCommonFields = [{
  component: componentTypes.TEXT_FIELD,
  name: 'access_url',
  label: __('Access URL'),
}, {
  component: componentTypes.TEXT_FIELD,
  name: 'pxe_directory',
  label: __('PXE Directory'),
}, {
  component: componentTypes.TEXT_FIELD,
  name: 'windows_images_directory',
  label: __('Windows Images Directory'),
}, {
  component: componentTypes.TEXT_FIELD,
  name: 'customization_directory',
  label: __('Customization Directory'),
}];

const imageMenusSubForm = [{
  component: componentTypes.SUB_FORM,
  title: __('PXE Image Menus'),
  name: 'pxe-image-menus-subform',
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: 'pxe_menus[0].file_name',
    label: __('Filename'),
  }],
}];

const createSchema = isEditing => ({
  fields: [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    name: 'basic-information',
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        label: __('Name'),
        isRequired: true,
        validate: [asyncValidatorDebounced],
      }, {
        component: 'input-with-dynamic-prefix',
        label: __('Uri'),
        name: 'uri',
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        prefixOptions: [{
          value: 's3://',
          label: 'Amazon Web Services',
        }, {
          value: 'nfs://',
          label: 'Network File System',
        }, {
          value: 'swift://',
          label: 'OpenStack Swift',
        }, {
          value: 'smb://',
          label: 'Samba',
        }],
      },
      {
        component: componentTypes.SUB_FORM,
        name: 'authentication-subform',
        condition: {
          when: 'uri',
          pattern: /^(?!nfs:\/\/).+.*/,
        },
        fields: [{
          component: 'validate-credentials',
          name: 'authentication.valid',
          edit: isEditing,
          validationDependencies: ['uri'],
          asyncValidate: formValues => new Promise((resolve, reject) => http.post('/pxe/pxe_server_async_cred_validation', {
            uri: formValues.uri,
            ...formValues.authentication,
          }).then(({ status, message }) => (status === 'error' ? reject(message) : resolve()))),
          fields: [{
            component: componentTypes.TEXT_FIELD,
            name: 'authentication.userid',
            label: __('Username'),
            isRequired: true,
            validate: [{ type: validatorTypes.REQUIRED }],
          }, {
            component: 'password-field',
            name: 'authentication.password',
            label: __('Password'),
            isRequired: true,
            validate: [{ type: validatorTypes.REQUIRED }],
          }],
        }],
      },
      ...basicInformationCommonFields,
    ],
  }, {
    component: 'hr',
    name: 'form-divider',
  },
  ...imageMenusSubForm,
  ],
});

export default createSchema;
