import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import PropTypes from 'prop-types';

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
    title: __('Category'),
    fields,
  };
};

const tabFile = {
  component: componentTypes.TAB_ITEM,
  title: __('File'),
  fields: [
    {
      component: 'header',
      label: __('File Entry'),
    },
    {
      component: 'editTable',
      name: 'files',
      headers: [
        __('Name'),
        __('Collect Contents?'),
      ],
      types: [
        PropTypes.string,
        PropTypes.bool,
      ],
      fields: [
        'name',
        'content',
      ],
    },
  ],
};

const tabRegistry = {
  component: componentTypes.TAB_ITEM,
  title: __('Registry'),
  fields: [
    {
      component: 'header',
      label: __('Registry Entry'),
    },
    {
      component: 'editTable',
      name: 'registry',
      headers: [
        __('Registry Hive'),
        __('Registry Key'),
        __('Registry Value'),
      ],
      types: [
        PropTypes.oneOf(['HKLM']),
        PropTypes.string,
        PropTypes.string,
      ],
      fields: [
        'hive',
        'key',
        'value',
      ],
    },
  ],
};

const tabEventLog = {
  component: componentTypes.TAB_ITEM,
  title: __('EventLog'),
  fields: [
    {
      component: 'header',
      label: __('Event Log Entry'),
    },
    {
      component: 'editTable',
      name: 'eventlog',
      headers: [
        __('Name'),
        __('Filter Message'),
        __('Level'),
        __('Source'),
        __('# of Days'),
      ],
      types: [
        PropTypes.string,
        PropTypes.string,
        PropTypes.string,
        PropTypes.string,
        PropTypes.number,
      ],
      fields: [
        'name',
        'filter.message',
        'filter.level',
        'filter.source',
        'filter.num_days',
      ],
    },
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
