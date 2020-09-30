import { componentTypes, validatorTypes } from '@@ddf';
import debouncePromise from '../../helpers/promise-debounce';
import { http, API } from '../../http_api';

export const asyncValidator = (value, serverId) =>
  API.get(`/api/pxe_servers?expand=resources&filter[]=name='${value ? value.replace('%', '%25') : ''}'`)
    .then((json) => {
      if (json.resources.find(({ id, name }) => name === value && id !== serverId)) {
        throw __('Name has already been taken');
      }
      if (value === '' || value === undefined) {
        throw __('Required');
      }
      return undefined;
    });

const asyncValidatorDebounced = debouncePromise(asyncValidator);

const basicInformationCommonFields = [{
  component: componentTypes.TEXT_FIELD,
  id: 'access_url',
  name: 'access_url',
  label: __('Access URL'),
}, {
  component: componentTypes.TEXT_FIELD,
  id: 'pxe_directory',
  name: 'pxe_directory',
  label: __('PXE Directory'),
}, {
  component: componentTypes.TEXT_FIELD,
  id: 'windows_images_directory',
  name: 'windows_images_directory',
  label: __('Windows Images Directory'),
}, {
  component: componentTypes.TEXT_FIELD,
  id: 'customization_directory',
  name: 'customization_directory',
  label: __('Customization Directory'),
}];

const imageMenusSubForm = [{
  component: componentTypes.SUB_FORM,
  title: __('PXE Image Menus'),
  id: 'pxe-image-menus-subform',
  name: 'pxe-image-menus-subform',
  fields: [{
    component: componentTypes.TEXT_FIELD,
    id: 'pxe_menus[0].file_name',
    name: 'pxe_menus[0].file_name',
    label: __('Filename'),
  }],
}];

const createSchema = isEditing => ({
  fields: [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    id: 'basic-information',
    name: 'basic-information',
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        id: 'name',
        name: 'name',
        label: __('Name'),
        isRequired: true,
        validate: [asyncValidatorDebounced],
      },
      {
        component: componentTypes.TEXT_FIELD,
        label: __('URI'),
        id: 'uri',
        name: 'uri',
        isRequired: true,
        placeholder: 'schema://host:port/path',
        helperText: __('URI should begin with s3:// for Amazon Web Services, nfs:// for Network File System, swift:// for OpenStack Swift or smb:// for Samba'),
        validate: [
          {
            type: validatorTypes.REQUIRED,
          },
          {
            type: validatorTypes.PATTERN,
            pattern: /^((s3)|(nfs)|(swift)|(smb)):\/\//,
            message: __('URI should begin with s3://, nfs://, swift:// or smb://'),
          },
        ],
      },
      {
        component: componentTypes.SUB_FORM,
        id: 'authentication-subform',
        name: 'authentication-subform',
        condition: {
          when: 'uri',
          pattern: /^(?!nfs:\/\/).+.*/,
        },
        fields: [{
          component: 'validate-credentials',
          id: 'authentication.valid',
          name: 'authentication.valid',
          edit: isEditing,
          validationDependencies: ['uri'],
          isRequired: true,
          asyncValidate: formValues => new Promise((resolve, reject) => http.post('/pxe/pxe_server_async_cred_validation', {
            uri: formValues.uri,
            ...formValues.authentication,
          }).then(({ status, message }) => (status === 'error' ? reject(message) : resolve()))),
          fields: [{
            component: componentTypes.TEXT_FIELD,
            id: 'authentication.userid',
            name: 'authentication.userid',
            label: __('Username'),
            isRequired: true,
            validate: [{ type: validatorTypes.REQUIRED }],
          }, {
            component: 'password-field',
            id: 'authentication.password',
            name: 'authentication.password',
            label: __('Password'),
            isRequired: true,
            validate: [{ type: validatorTypes.REQUIRED }],
          }],
        }],
      },
      ...basicInformationCommonFields,
    ],
  },
  ...imageMenusSubForm,
  ],
});

export default createSchema;
