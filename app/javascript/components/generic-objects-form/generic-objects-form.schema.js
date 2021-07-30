/* eslint-disable camelcase */
import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (initialValues = {}, edit, promise) => {
  const edit_field = [
    {
      component: componentTypes.SUB_FORM,
      name: 'file_section',
      id: 'file_section',
      condition: {
        when: 'image_update',
        is: true,
      },
      fields: [{
        component: 'file-upload',
        label: __('Custom Image File'),
        name: 'file_upload',
        type: 'file',
        validate: [{ type: 'file', maxSize: 5000000 }],
      }],
    },
    {
      component: componentTypes.SUB_FORM,
      name: 'edit_section',
      id: 'edit_section',
      condition: {
        when: 'image_update',
        is: false,
      },
      fields: [{
        component: 'file-edit',
        label: __('Current Custom Image File'),
        name: 'file_edit',
        src: !!initialValues.picture ? initialValues.picture.image_href : '',
        description: __('Delete File'),
      }],
    },
    {
      component: componentTypes.SWITCH,
      name: 'image_update',
      hideField: true,
    },
  ];

  return ({
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
        maxLength: 255,
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'attributes',
        id: 'attributes',
        label: __('Attributes'),
        noItemsMessage: __('None'),
        buttonLabels: {
          add: __('Add'),
          remove: __('Remove'),
        },
        AddButtonProps: {
          size: 'small',
        },
        RemoveButtonProps: {
          size: 'small',
        },
        fields: [
          {
            component: componentTypes.TEXT_FIELD,
            name: 'attributes_name',
            label: __('Name'),
            validate: [{ type: validatorTypes.REQUIRED }, { type: 'syntax' }],
          },
          {
            component: componentTypes.SELECT,
            name: 'type',
            label: __('Type'),
            placeholder: __('<Choose>'),
            includeEmpty: true,
            loadOptions: () => promise.then(({ data: { allowed_types } }) =>
              Object.keys(allowed_types).map((key) => ({
                value: key,
                label: __(allowed_types[key]),
              }))),
            validate: [{ type: validatorTypes.REQUIRED }],
          },
        ],
      },
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'associations',
        id: 'associations',
        label: __('Associations'),
        noItemsMessage: __('None'),
        buttonLabels: {
          add: __('Add'),
          remove: __('Remove'),
        },
        AddButtonProps: {
          size: 'small',
        },
        RemoveButtonProps: {
          size: 'small',
        },
        fields: [
          {
            component: componentTypes.TEXT_FIELD,
            name: 'associations_name',
            label: __('Name'),
            validate: [{ type: validatorTypes.REQUIRED }, { type: 'syntax' }],
          },
          {
            component: componentTypes.SELECT,
            name: 'class',
            label: __('Class'),
            placeholder: __('<Choose>'),
            isSearchable: true,
            loadOptions: () => promise.then(({ data: { allowed_association_types } }) =>
              Object.keys(allowed_association_types).map((key) => ({
                value: key,
                label: __(allowed_association_types[key]),
              }))),
            validate: [{ type: validatorTypes.REQUIRED }],
          },
        ],
      },
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'methods',
        id: 'methods',
        label: __('Methods'),
        noItemsMessage: __('None'),
        buttonLabels: {
          add: __('Add'),
          remove: __('Remove'),
        },
        AddButtonProps: {
          size: 'small',
        },
        RemoveButtonProps: {
          size: 'small',
        },
        fields: [
          {
            component: componentTypes.TEXT_FIELD,
            name: 'methods_name',
            label: __('Name'),
            validate: [{ type: validatorTypes.REQUIRED }, { type: 'syntax' }],
          },
        ],
      },
      ...(edit ? edit_field : [{
        component: componentTypes.SUB_FORM,
        name: 'file_section',
        id: 'file_section',
        fields: [{
          component: 'file-upload',
          label: __('Custom Image File'),
          name: 'file_upload',
          type: 'file',
          validate: [{ type: 'file', maxSize: 5000000 }],
        }],
      }]),
    ],
  });
};

export default createSchema;
