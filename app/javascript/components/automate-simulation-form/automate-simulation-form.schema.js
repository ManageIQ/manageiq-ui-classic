import { componentTypes, validatorTypes } from '@@ddf';

const targetsURL = (targetClass) => `/miq_ae_tools/get_form_targets?target_class=${encodeURIComponent(targetClass)}`;
const loadTargets = (selectedTargetClass) => http.get(targetsURL(selectedTargetClass))
  .then((formVars) => {
    if (formVars && formVars.targets) {
      return [
        { label: `<${__('None')}>`, value: '' },
        ...formVars.targets.map(([key, value]) => ({
          label: String(key),
          value: String(value),
        })),
      ];
    }
    return [{ label: `<${__('None')}>`, value: '' }];
  });

const createSchema = (
  resolve, maxNameLength, url, attrValuesPairs, maxLength, typeClassesOptions, targetClass, setTargetClass,
) => {
  const fields = [
    {
      component: componentTypes.PLAIN_TEXT,
      id: 'object_details',
      name: 'object_details',
      className: 'automate-object-details',
      label: __('Object Details'),
      style: { fontSize: '16px' },
    },
    {
      component: componentTypes.SELECT,
      id: 'instance_name',
      name: 'instance_name',
      className: 'automate-instance-name',
      label: __('System/Process'),
      initialValue: resolve.new.instance_name || (resolve.instance_names && resolve.instance_names[0]),
      validate: [{ type: validatorTypes.REQUIRED }],
      isSearchable: true,
      simpleValue: true,
      options: resolve.instance_names.map((name) => ({ label: name, value: name })),
      url,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'object_message',
      name: 'object_message',
      className: 'automate-object-message',
      label: __('Message'),
      maxLength: maxNameLength,
      initialValue: resolve.new.object_message,
      isRequired: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'object_request',
      name: 'object_request',
      className: 'automate-object-request',
      label: __('Request'),
      initialValue: resolve.new.object_request,
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.PLAIN_TEXT,
      id: 'object_attribute',
      name: 'object_attribute',
      className: 'automate-object-attribute',
      label: __('Object Attribute'),
      style: { fontSize: '16px' },
    },
    {
      component: componentTypes.SELECT,
      id: 'target_class',
      name: 'target_class',
      label: __('Type'),
      options: typeClassesOptions,
      className: 'automate-target-class',
      isSearchable: true,
      simpleValue: true,
      isRequired: true,
      onChange: (value) => {
        if (value !== targetClass) {
          setTargetClass(value);
        }
      },
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.SELECT,
      id: `target_id_${targetClass}`,
      name: `target_id_${targetClass}`,
      key: `target_id-${targetClass}`,
      label: __('Selection'),
      className: 'automate-selection-target',
      isRequired: true,
      loadOptions: () => (targetClass ? loadTargets(targetClass) : Promise.resolve([{ label: `<${__('None')}>`, value: '' }])),
      condition: {
        not: {
          when: 'target_class',
          isEmpty: true,
        },
      },
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      id: 'simulationParameters',
      component: componentTypes.PLAIN_TEXT,
      name: 'simulationParameters',
      className: 'automate-simulation-parameters',
      label: __('Simulation Parameters'),
      style: { fontSize: '16px' },
    },
    {
      component: componentTypes.CHECKBOX,
      id: 'readonly',
      name: 'readonly',
      className: 'automate-readonly',
      label: __('Execute Methods'),
      title: 'Simulation parameters',
    },
    {
      id: 'AttributeValuePairs',
      component: componentTypes.PLAIN_TEXT,
      name: 'AttributeValuePairs',
      label: __('Attribute/Value Pairs'),
      style: { fontSize: '16px' },
    },
    {
      component: componentTypes.FIELD_ARRAY,
      name: 'attrs',
      id: 'attrs',
      fieldKey: 'field_array',
      maxItems: attrValuesPairs.length,
      AddButtonProps: {
        size: 'sm',
      },
      RemoveButtonProps: {
        size: 'sm',
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          className: 'attribute_value_field_wrapper',
          name: 'attribute',
          label: 'attribute',
          maxLength,
          isRequired: true,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.TEXT_FIELD,
          className: 'attribute_value_field_wrapper',
          name: 'value',
          label: 'value',
          maxLength,
          isRequired: true,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
      ],
    },
  ];

  if (!document.getElementById('description') && document.getElementById('object_message')) {
    document.getElementById('object_message').focus();
  }

  return {
    title: 'Object Details',
    fields,
  };
};

export default createSchema;
