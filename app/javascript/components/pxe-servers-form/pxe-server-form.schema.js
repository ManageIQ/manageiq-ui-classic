import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { http } from '../../http_api';

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
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        label: __('Name'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
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
            component: 'secret-switch-field',
            name: 'authentication.password',
            label: __('Password'),
            edit: isEditing,
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
