import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (resolve, max_name_length, url, ae_ansible_custom_button, form_action, ae_custom_button, attr_values_pairs, maxlength) => {
  const fields = [
    {
      component: componentTypes.SELECT,
      id: 'instance_name',
      name: 'instance_name',
      label: __('System/Process'),
      initialValue: resolve.instance_names.sort((b, a) => a.toLowerCase().localeCompare(b.toLowerCase())),
      validate: [{ type: validatorTypes.REQUIRED }],
      isSearchable: true,
      simpleValue: true,
      options: resolve.instance_names.map(name => ({ label: name, value: name })),
      onChange: (value) => miqSelectPickerEvent(value, url),
      url: url,
    },
    {
      id: 'simulationParameters',
      component: componentTypes.PLAIN_TEXT,
      name: 'simulationParameters',
      label: __('Simulation Parameters'),
      style: { fontSize: '16px' }
    },
    {
      component: componentTypes.CHECKBOX,
      id: 'readonly',
      name: 'readonly',
      label: __('Execute Methods'),
      initialValue: resolve.new.readonly !== true,
      title : "Simulation parameters"
    },
    {
      id: 'AttributeValuePairs',
      component: componentTypes.PLAIN_TEXT,
      name: 'AttributeValuePairs',
      label: __('Attribute/Value Pairs'),
      style: { fontSize: '16px' }
    },
  ];

  if (!ae_ansible_custom_button) {
    fields.splice(1, 0, {
      component: componentTypes.TEXT_FIELD,
      id: 'object_message',
      name: 'object_message',
      label: __('Message'),
      maxLength: max_name_length,
      initialValue: resolve.new.object_message,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true
    }),
    fields.splice(2, 0, {
      component: componentTypes.TEXT_FIELD,
      id: 'object_request',
      name: 'object_request',
      label: __('Request'),
      initialValue: resolve.new.object_request,
      validate: [{ type: validatorTypes.REQUIRED }],
    });
  }

  if (!document.getElementById('description') && document.getElementById('object_message')) {
    document.getElementById('object_message').focus();
  }

  if (form_action != "miq_action") {
    if (ae_custom_button) {
      fields.splice(3, 0, {
        id: 'objectAttribute_1',
        component: componentTypes.PLAIN_TEXT,
        name: 'objectAttribute_1',
        label: __('Object Attribute 1'),
        style: { fontSize: '16px' }
      }),
      fields.splice(4, 0, {
        component: componentTypes.TEXT_FIELD,
        name: 'object_attribute_1',
        label:  __('Type'),
        isReadOnly: true,
        content: `${_("Type")}: ${ui_lookup({ model: resolve.target_class })}`,
      })
    } else {
      const targetClassesOptions = [
        { label: "<none>", value: null },
        ...Object.entries(resolve.target_classes).map(([key, value]) => ({ label: key, value: value }))
      ];
      fields.splice(3, 0, {
        id: 'objectAttribute',
        component: componentTypes.PLAIN_TEXT,
        name: 'objectAttribute',
        label: __('Object Attribute'),
        style: { fontSize: '16px' }
      }),
      fields.splice(4, 0, {
        component: componentTypes.SELECT,
        id: 'target_class',
        name: 'target_class',
        label: __('Type'),
        initialValue: resolve.new.target_class,
        validate: [{ type: validatorTypes.REQUIRED }],
        isSearchable: true,
        simpleValue: true,
        options: targetClassesOptions,
        onChange: (value) => miqSelectPickerEvent(value, url),
        url: url,
      })
    }
  }

  attr_values_pairs.forEach((_, i) => {
    const f = `attribute_${i + 1}`;
    const v = `value_${i + 1}`;
    const labelKey = `attributeValuePairLabel_${i + 1}`;

    fields.push(
      {
        component: componentTypes.PLAIN_TEXT,
        id: labelKey,
        name: labelKey,
        label: `${i + 1}`,
        style: {fontWeight: 'bold'}
      },
      {
        component: componentTypes.TEXT_FIELD,
        id: f,
        name: f,
        maxLength: maxlength,
        validate: [{ type: validatorTypes.REQUIRED }],
        fieldprops: {
          className: 'form-control col-md-4',
          'data-miq_observe': JSON.stringify({ interval: '.5', url: url })
        }
      },
      {
        component: componentTypes.TEXT_FIELD,
        id: v,
        name: v,
        maxLength: maxlength,
        validate: [{ type: validatorTypes.REQUIRED }],
        fieldprops: {
          className: 'form-control col-md-4',
          'data-miq_observe': JSON.stringify({ interval: '.5', url: url })
        }
      }
    );
  })

  return {
    title: 'Object Details',
    fields: fields,
  };
};

export default createSchema;
