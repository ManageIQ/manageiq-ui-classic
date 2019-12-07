import { componentTypes, dataTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

import { API } from '../../http_api';

const postProcessValidation = ({ isRequired, validate: [{ pattern }] = [{}] }) => {
  const validate = !pattern && !isRequired ? undefined : [
    pattern ? { type: validatorTypes.PATTERN_VALIDATOR, pattern } : undefined,
    isRequired ? { type: validatorTypes.REQUIRED } : undefined,
  ].filter(Boolean);

  return { isRequired, validate };
};

const postProcessInitialValues = ({ initialValue = [], options = [], multi }) => {
  const opts = options.map(option => option.value);

  if (!multi) {
    return { initialValue: opts.includes(initialValue) ? initialValue : undefined };
  }

  const filtered = initialValue.filter(value => opts.includes(value));
  return { initialValue: filtered.length > 0 ? filtered : undefined };
};

const commonFields = [
  {
    name: 'name',
    label: 'Name',
    component: componentTypes.TEXT_FIELD,
  },
  {
    name: 'title',
    label: 'Label',
    component: componentTypes.TEXT_FIELD,
  },
  {
    name: 'helperText',
    label: 'Help',
    component: componentTypes.TEXT_FIELD,
  },
  {
    name: 'visible',
    label: 'Visible',
    component: componentTypes.CHECKBOX,
  },
  {
    name: 'isRequired',
    label: 'Required',
    component: componentTypes.CHECKBOX,
    DDF: {
      postProcess: postProcessValidation,
    },
  },
  {
    name: 'isReadOnly',
    label: 'Read only',
    component: componentTypes.CHECKBOX,
  },
  {
    name: 'reconfigurable',
    label: 'Reconfigurable',
    component: componentTypes.CHECKBOX,
  },
  {
    name: 'fieldsToRefresh',
    label: 'Fields to refresh',
    component: componentTypes.SELECT,
    hideField: true,
    multi: true,
  },
];

const dynamic = [
  {
    name: 'dynamic',
    label: 'Dynamic',
    component: componentTypes.CHECKBOX,
  },
  {
    name: 'resourceAction',
    label: 'Entry point',
    component: componentTypes.TEXT_FIELD,
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
    condition: {
      when: 'dynamic',
      is: true,
    },
  },
  {
    name: 'loadValuesOnInit',
    label: 'Load values on init',
    component: componentTypes.CHECKBOX,
    initialValue: true,
    condition: {
      when: 'dynamic',
      is: true,
    },
  },
  {
    name: 'showRefresh',
    label: 'Show refresh button',
    component: componentTypes.CHECKBOX,
    condition: {
      when: 'dynamic',
      is: true,
    },
  },
];

const dataType = {
  name: 'dataType',
  label: 'Submit as',
  component: componentTypes.SELECT,
  options: [
    { label: 'String', value: dataTypes.STRING },
    { label: 'Number', value: dataTypes.NUMBER },
  ],
};

const defaultString = {
  name: 'initialValue',
  label: 'Default value',
  component: componentTypes.TEXT_FIELD,
};

const validator = {
  name: 'validate[0].pattern',
  label: 'Validator',
  component: componentTypes.TEXT_FIELD,
  DDF: {
    postProcess: postProcessValidation,
  },
};

const editSchemas = {
  [componentTypes.TEXT_FIELD]: [
    ...commonFields,
    ...dynamic,
    validator,
    defaultString,
    dataType,
    {
      name: 'type',
      label: 'Input type',
      component: componentTypes.SELECT,
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Number', value: 'number' },
        { label: 'Password', value: 'password' },
      ],
    },
  ],
  [componentTypes.TEXTAREA_FIELD]: [
    ...commonFields,
    ...dynamic,
    validator,
    defaultString,
    dataType,
  ],
  [componentTypes.CHECKBOX]: [
    ...commonFields,
    ...dynamic,
    {
      name: 'initialValue',
      label: 'Checked',
      component: componentTypes.CHECKBOX,
    },
  ],
  [componentTypes.SELECT]: [
    ...commonFields,
    ...dynamic,
    {
      name: 'multi',
      label: 'Multiselect',
      component: componentTypes.CHECKBOX,
      DDF: {
        synchronize: 'multi',
      },
    },
    {
      ...dataType,
      DDF: {
        synchronize: 'dataType',
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'initialValue',
      type: 'hidden',
      DDF: {
        postProcess: postProcessInitialValues,
      },
    },
    {
      name: 'options',
      label: 'Options',
      component: componentTypes.FIELD_ARRAY,
      itemDefault: {},
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'label',
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'value',
        },
      ],
      DDF: {
        preProcess: ({ multi }) => ({ multi }),
      },
    },
  ],
  [componentTypes.RADIO]: [
    ...commonFields,
    ...dynamic,
    {
      ...dataType,
      DDF: {
        synchronize: 'dataType',
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'initialValue',
      type: 'hidden',
      DDF: {
        postProcess: postProcessInitialValues,
      },
    },
    {
      name: 'options',
      label: 'Options',
      component: componentTypes.FIELD_ARRAY,
      itemDefault: {},
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'label',
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'value',
        },
      ],
    },
  ],
  [componentTypes.DATE_PICKER]: [
    ...commonFields,
    ...dynamic,
    {
      name: 'disabledDays[0][before]',
      label: 'Disable past dates',
      component: componentTypes.CHECKBOX,
      DDF: {
        synchronize: 'disabledDays',
        postProcess: ({ disabledDays: [{ before: disablePast }] = [{}] }) => ({ disabledDays: disablePast ? [{ before: 'today' }] : undefined }),
      },
    },
    {
      name: 'variant',
      component: componentTypes.SELECT,
      label: 'Variant',
      options: [
        {
          label: 'Date',
          value: 'date',
        },
        {
          label: 'Datetime',
          value: 'date-time',
        },
      ],
      DDF: {
        synchronize: 'variant',
      },
    },
    {
      name: 'initialValue',
      label: 'Default value',
      component: componentTypes.DATE_PICKER,
      DDF: {
        preProcess: ({ variant, disabledDays }) => ({ variant, disabledDays }),
      },
    },
  ],
  'tag-control': [
    ...commonFields,
    {
      component: componentTypes.CHECKBOX,
      name: 'forceSingleValue',
      label: 'Force single value',
    },
    {
      component: componentTypes.SELECT,
      name: 'categoryId',
      label: 'Category',
      loadOptions: () =>
        API.get('/api/categories?expand=resources&attributes=id,description')
          .then(({ resources }) => resources.map(({ id: value, description: label }) => ({ label, value }))),
    },
  ],
  [componentTypes.SUB_FORM]: [
    {
      name: 'name',
      label: 'Name',
      component: componentTypes.TEXT_FIELD,
    },
    {
      name: 'title',
      label: 'Title',
      component: componentTypes.TEXT_FIELD,
    },
    {
      name: 'description',
      label: 'Description',
      component: componentTypes.TEXTAREA_FIELD,
    },
  ],
  [componentTypes.TAB_ITEM]: [
    {
      name: 'name',
      label: 'Name',
      component: componentTypes.TEXT_FIELD,
    },
    {
      name: 'title',
      label: 'Title',
      component: componentTypes.TEXT_FIELD,
    },
  ],
  undefined: [ // special case for the top-level dialog information
    {
      name: 'title',
      label: 'Name',
      component: componentTypes.TEXT_FIELD,
    },
    {
      name: 'description',
      label: 'Description',
      component: componentTypes.TEXTAREA_FIELD,
      rows: 6,
    },
  ],
};

const editSchema = ({ component, name: skipField } = {}, { fields: [{ fields }] }) => {
  const options = fields.reduce(
    (_, { fields = [] }) => [
      ..._,
      ...fields.reduce(
        (__, { fields = [] }) =>
          fields.filter(({ name }) => name !== skipField).reduce(
            (___, { dynamic, label, name: value }) =>
              (dynamic ? [...___, { value, label }] : ___),
            [],
          ),
        [],
      ),
    ],
    [],
  );

  const dropdown = editSchemas[component].find(({ name }) => name === 'fieldsToRefresh');
  // If there are no dynamic fields or no dropdown, do not modify the editSchema
  if (options.length === 0 || !dropdown) {
    return editSchemas[component];
  }

  const idx = editSchemas[component].indexOf(dropdown);

  return [
    ...editSchemas[component].slice(0, idx),
    {
      ...dropdown,
      hideField: false,
      multi: true,
      options,
    },
    ...editSchemas[component].slice(idx + 1),
  ];
};

export default editSchema;
