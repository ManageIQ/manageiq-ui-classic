import { TextAlignLeft, TextAlignCenter, Checkbox, ChevronDown, RadioButton, Calendar, Time, Tag } from '@carbon/react/icons';

// SD_ACTIONS keys – imported from helper.js (re-exported here for convenience)
export { SD_ACTIONS } from './helper';

// Field type definitions for the palette chooser
export const fieldComponents = [
  {
    id: 'DialogFieldTextBox',
    label: __('Text Box'),
    icon: TextAlignLeft,
  },
  {
    id: 'DialogFieldTextAreaBox',
    label: __('Text Area'),
    icon: TextAlignCenter,
  },
  {
    id: 'DialogFieldCheckBox',
    label: __('Check Box'),
    icon: Checkbox,
  },
  {
    id: 'DialogFieldDropDownList',
    label: __('Dropdown'),
    icon: ChevronDown,
  },
  {
    id: 'DialogFieldRadioButton',
    label: __('Radio Button'),
    icon: RadioButton,
  },
  {
    id: 'DialogFieldDateControl',
    label: __('Datepicker'),
    icon: Calendar,
  },
  {
    id: 'DialogFieldDateTimeControl',
    label: __('Timepicker'),
    icon: Time,
  },
  {
    id: 'DialogFieldTagControl',
    label: __('Tag Control'),
    icon: Tag,
  },
];

// Default field shape matching Angular ground truth (toolboxComponent.ts)
export const defaultField = (type, position = 0) => {
  const base = {
    name: generateFieldName(type),
    label: fieldLabelForType(type),
    description: '',
    type,
    display: 'edit',
    display_method_options: {},
    read_only: false,
    required: false,
    required_method_options: {},
    default_value: '',
    values_method_options: {},
    position,
    dynamic: false,
    show_refresh_button: false,
    load_values_on_init: true,
    auto_refresh: false,
    trigger_auto_refresh: false,
    reconfigurable: false,
    visible: true,
    options: {
      protected: false,
    },
    resource_action: {
      resource_type: 'DialogField',
      ae_attributes: {},
    },
    _version: 1,
  };

  switch (type) {
    case 'DialogFieldTextBox':
    case 'DialogFieldTextAreaBox':
      return { ...base, validator_type: false };

    case 'DialogFieldDropDownList':
      return {
        ...base,
        data_type: 'string',
        values: [['1', 'One'], ['2', 'Two'], ['3', 'Three']],
        options: { ...base.options, sort_by: 'description', sort_order: 'ascending', force_multi_value: false },
      };

    case 'DialogFieldRadioButton':
      return {
        ...base,
        data_type: 'string',
        values: [['1', 'One'], ['2', 'Two'], ['3', 'Three']],
        options: { ...base.options, sort_by: 'description', sort_order: 'ascending' },
      };

    case 'DialogFieldDateControl':
    case 'DialogFieldDateTimeControl':
      return { ...base, options: { ...base.options, show_past_dates: false } };

    case 'DialogFieldTagControl':
      return {
        ...base,
        data_type: 'string',
        values: [],
        options: {
          ...base.options,
          category_id: '',
          force_single_value: false,
          sort_by: 'description',
          sort_order: 'ascending',
        },
      };

    default:
      return base;
  }
};

let fieldCounters = {};

export const resetFieldCounters = () => { fieldCounters = {}; };

const generateFieldName = (type) => {
  const base = typeToNameBase(type);
  fieldCounters[base] = (fieldCounters[base] || 0) + 1;
  return `${base}_${fieldCounters[base]}`;
};

const typeToNameBase = (type) => {
  const map = {
    DialogFieldTextBox: 'text_box',
    DialogFieldTextAreaBox: 'text_area_box',
    DialogFieldCheckBox: 'check_box',
    DialogFieldDropDownList: 'dropdown_list',
    DialogFieldRadioButton: 'radio_button',
    DialogFieldDateControl: 'date_control',
    DialogFieldDateTimeControl: 'date_time_control',
    DialogFieldTagControl: 'tag_control',
  };
  return map[type] || 'field';
};

const fieldLabelForType = (type) => {
  const comp = fieldComponents.find((c) => c.id === type);
  return comp ? comp.label : __('Field');
};
