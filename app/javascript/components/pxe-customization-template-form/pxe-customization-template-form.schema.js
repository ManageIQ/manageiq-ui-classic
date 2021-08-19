import { componentTypes, validatorTypes } from '@@ddf';

const setFormat = (type) => (typeof type !== 'undefined' && type === 'CustomizationTemplateKickstart' ? 'shell' : 'xml');

const createSchema = ({ type } = {}) => ({
  fields: [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    id: 'basic-information',
    name: 'basic-information',
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        id: 'name',
        label: __('Name'),
        maxLength: 255,
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'description',
        id: 'description',
        label: __('Description'),
        maxLength: 100,
      },
      {
        component: componentTypes.SELECT,
        name: 'pxe_image_type_id',
        id: 'pxe_image_type_id',
        label: __('Image Type'),
        placeholder: __('<Choose>'),
        includeEmpty: true,
        loadOptions: () => API.get(`/api/pxe_image_types?attributes=name,id&expand=resources`).then(({ resources }) =>
          resources.map(({ id, name }) => ({ value: id, label: name }))),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.SELECT,
        name: 'type',
        id: 'type',
        label: __('Type'),
        placeholder: __('<Choose>'),
        includeEmpty: true,
        options: [
          {
            label: 'Kickstart',
            value: 'CustomizationTemplateKickstart',
          },
          {
            label: 'Sysprep',
            value: 'CustomizationTemplateSysprep',
          },
          {
            label: 'CloudInit',
            value: 'CustomizationTemplateCloudInit',
          },
        ],
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: 'code-editor',
        id: 'script',
        name: 'script',
        label: __('Script'),
        mode: setFormat(type),
      },
    ],
  }],
});

export default createSchema;
