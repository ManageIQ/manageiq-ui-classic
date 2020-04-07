const defaults = {
  description: '',
  display: 'edit',
  display_method_options: {},
  read_only: false,
  required: false,
  required_method_options: {},
  default_value: '',
  values_method_options: {},
  position: 0,
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
};

const DialogField = ({ type, icon, label, name, ...extra }) => ({
  icon,
  label,
  placeholders: {
    ...defaults,
    ...extra,
    label,
    name,
    type,
  },
});

export const fields = [
  DialogField({
    type: 'DialogFieldTextBox',
    icon: 'fa fa-font',
    label: __('Text Box'),
    name: 'text_box',
    validator_type: false,
  }),
  DialogField({
    type: 'DialogFieldTextAreaBox',
    icon: 'fa fa-file-text-o',
    label: __('Text Area'),
    name: 'textarea_box',
    validator_type: false,
  }),
  DialogField({
    type: 'DialogFieldCheckBox',
    icon: 'fa fa-check-square-o',
    label: __('Check Box'),
    name: 'check_box',
  }),
  DialogField({
    type: 'DialogFieldDropDownList',
    icon: 'fa fa-caret-square-o-down',
    label: __('Dropdown'),
    name: 'dropdown_list',
    data_type: 'string',
    values: [
      ['1', __('One')],
      ['2', __('Two')],
      ['3', __('Three')],
    ],
    options: {
      sort_by: 'description',
      sort_order: 'ascending',
      force_multi_value: false,
    },
  }),
  DialogField({
    type: 'DialogFieldRadioButton',
    icon: 'fa fa-circle-o',
    label: __('Radio Button'),
    name: 'radio_button',
    data_type: 'string',
    values: [
      ['1', __('One')],
      ['2', __('Two')],
      ['3', __('Three')],
    ],
    options: {
      sort_by: 'description',
      sort_order: 'ascending',
    },
  }),
  DialogField({
    type: 'DialogFieldDateControl',
    icon: 'fa fa-calendar',
    label: __('Datepicker'),
    name: 'date_control',
    options: {
      show_past_dates: false,
    },
  }),
  DialogField({
    type: 'DialogFieldDateTimeControl',
    icon: 'fa fa-clock-o',
    label: __('Timepicker'),
    name: 'date_time_control',
    options: {
      show_past_dates: false,
    },
  }),
  DialogField({
    type: 'DialogFieldTagControl',
    icon: 'fa fa-tags',
    label: __('Tag Control'),
    name: 'tag_control',
    data_type: 'string',
    values: [],
    options: {
      category_id: '',
      force_single_value: false,
      sort_by: 'description',
      sort_order: 'ascending',
    },
  }),
];
