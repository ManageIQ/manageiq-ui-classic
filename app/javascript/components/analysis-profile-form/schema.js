import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

const FAKE = {
  component: componentTypes.TEXT_FIELD,
  name: 'fake',
  label: 'fake',
};

const required = (field) => {
  field.validateOnMount = true;
  field.validate = field.validate || [];

  field.validate.push({
    type: validatorTypes.REQUIRED,
  });
  field.isRequired = true;

  console.log('field', field);
  return field;
};

const maxLength = (val, field) => {
  field.validateOnMount = true;
  field.validate = field.validate || [];

  field.validate.push({
    type: validatorTypes.MAX_LENGTH,
    threshold: val,
    treshold: val,  // FIXME: remove when fixed to use threshold
  });
  field.maxLength = val;

  return field;
};

const tabCategory = (choices) => {
  let fields = [
    {
      component: 'header',
      label: __('Category Selection'),
    },
  ];

  Object.keys(choices).forEach((k) => {
    fields.push({
      component: componentTypes.CHECKBOX,
      name: `category[${k}]`,
      label: __(choices[k]),
      hideLabel: true,
    });
  });

  return {
    component: componentTypes.TAB_ITEM,
    title: __("Category"),
    fields,
  };
};

const tabFile = {
  component: componentTypes.TAB_ITEM,
  title: __("File"),
  fields: [
    FAKE,
  ],
};

const tabRegistry = {
  component: componentTypes.TAB_ITEM,
  title: __("Registry"),
  fields: [
    FAKE,
  ],
};

const tabEventLog = {
  component: componentTypes.TAB_ITEM,
  title: __("EventLog"),
  fields: [
    FAKE,
  ],
};

function tabs(scanMode, categoryChoices) {
  switch (scanMode) {
    case 'Host':
      return [
        tabFile,
        tabEventLog,
      ];
    case 'Vm':
      return [
        tabCategory(categoryChoices),
        tabFile,
        tabRegistry,
        tabEventLog,
      ];
    default:
      throw `Unknown scanMode: ${scanMode}`;
  }
}

function createSchema(scanMode, categoryChoices) {
  return {
    fields: [
      {
        component: 'header',
        label: __('Basic Information'),
      },
      required(maxLength(ManageIQ.ViewHelper.MAX_NAME_LEN, {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        label: __('Name'),
        autoFocus: true,
      })),
      required(maxLength(ManageIQ.ViewHelper.MAX_DESC_LEN, {
        component: componentTypes.TEXT_FIELD,
        name: 'description',
        label: __('Description'),
      })),
      {
        component: 'output',
        label: __('Type'),
        value: scanMode,
      },
      {
        component: componentTypes.TABS,
        fields: tabs(scanMode, categoryChoices),
      },
    ],
  };
}

export default createSchema;
