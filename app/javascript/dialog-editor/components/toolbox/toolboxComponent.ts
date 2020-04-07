class DialogField {
  constructor(type, icon, label, name, options = {}) {
    this.icon = icon;
    this.label = label;
    this.placeholders = Object.assign({
      name: name,
      description: '',
      type: type,
      display: 'edit',
      display_method_options: {},
      read_only: false,
      required: false,
      required_method_options: {},
      default_value: '',
      values_method_options: {},
      label: label,
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
    }, options);
  }
}

/**
 * Controller for the Dialog Editor toolbox component
 */
export class ToolboxController {
  fields = {
    dialogFieldTextBox:
      new DialogField('DialogFieldTextBox', 'fa fa-font', __('Text Box'), 'text_box', {
        validator_type: false,
      }),
    dialogFieldTextAreaBox:
      new DialogField('DialogFieldTextAreaBox', 'fa fa-file-text-o', __('Text Area'), 'textarea_box', {
        validator_type: false,
      }),
    dialogFieldCheckBox:
      new DialogField('DialogFieldCheckBox', 'fa fa-check-square-o', __('Check Box'), 'check_box'),
    dialogFieldDropDownList:
      new DialogField('DialogFieldDropDownList', 'fa fa-caret-square-o-down', __('Dropdown'), 'dropdown_list', {
        data_type: 'string',
        values: [['1', __('One')], ['2', __('Two')], ['3', __('Three')]],
        options: {
          sort_by: 'description',
          sort_order: 'ascending',
          force_multi_value: false,
        },
      }),
    dialogFieldRadioButton:
      new DialogField('DialogFieldRadioButton', 'fa fa-circle-o', __('Radio Button'), 'radio_button', {
        data_type: 'string',
        values: [['1', __('One')], ['2', __('Two')], ['3', __('Three')]],
        options: {sort_by: 'description', sort_order: 'ascending'},
      }),
    dialogFieldDateControl:
      new DialogField('DialogFieldDateControl', 'fa fa-calendar', __('Datepicker'), 'date_control', {
        options: { show_past_dates: false },
      }),
    dialogFieldDateTimeControl:
      new DialogField('DialogFieldDateTimeControl', 'fa fa-clock-o', __('Timepicker'), 'date_time_control', {
        options: { show_past_dates: false },
      }),
    dialogFieldTagControl:
      new DialogField('DialogFieldTagControl', 'fa fa-tags', __('Tag Control'), 'tag_control', {
        data_type: 'string',
        values: [],
        options: {
          category_id: '',
          force_single_value: false,
          sort_by: 'description',
          sort_order: 'ascending',
        },
      }),
  };
}

/**
 * @description
 *    Component is used as a toolbox for the Dialog Editor.
 * @example
 * <dialog-editor-field-static>
 * </dialog-editor-field-static>
 */
export default class Toolbox {
  template = require('./toolbox.html');
  controller = ToolboxController;
  controllerAs = 'vm';
}
