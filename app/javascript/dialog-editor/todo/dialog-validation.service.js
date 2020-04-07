const tagHasCategory = (field) => field.options && field.options.category_id;

export class DialogValidationService {
  invalid = {};
  validators = {};

  constructor() {
    this.validators = {
      dialog: [
        dialog => ({ status: ! _.isEmpty(dialog.label),
                     errorMessage: __('Dialog needs to have a label') }),
        dialog => ({ status: dialog.dialog_tabs.length > 0,
                     errorMessage: __('Dialog needs to have at least one tab') }),
      ],
      tabs: [
        tab => ({ status: ! _.isEmpty(tab.label),
                  errorMessage: __('Dialog tab needs to have a label') }),
        tab => ({ status: tab.dialog_groups.length > 0,
                  errorMessage: __('Dialog tab needs to have at least one section') }),
      ],
      groups: [
        group => ({ status: ! _.isEmpty(group.label),
                    errorMessage: __('Dialog section needs to have a label') }),
        group => ({ status: group.dialog_fields.length > 0,
                    errorMessage: __('Dialog section needs to have at least one field') }),
      ],
      fields: [
        field => ({ status: ! _.isEmpty(field.name),
                    errorMessage: __('Dialog field needs to have a name') }),
        field => ({ status: ! _.isEmpty(field.label),
                    errorMessage: __('Dialog field needs to have a label') }),
        field => ({ status: ! ((field.type === 'DialogFieldDropDownList' ||
                                field.type === 'DialogFieldRadioButton')
                               && (!field.dynamic && _.isEmpty(field.values))),
                    errorMessage: __('Dropdown needs to have entries') }),
        field => ({ status: (field.type !== 'DialogFieldTagControl') || tagHasCategory(field),
                    errorMessage: __('Category needs to be set for TagControl field') }),
        field => ({ status: ! (field.dynamic && _.isEmpty(field.resource_action.ae_class)),
                    errorMessage: __('Entry Point needs to be set for Dynamic elements') }),
        field => ({ status: ! ((field.type === 'DialogFieldDropDownList' ||
                                field.type === 'DialogFieldRadioButton')
                               && (field.data_type === 'integer')
                               && (!_.chain(field.values)
                                   .map(dialog_entries => _.toNumber(dialog_entries[0]))
                                   .every(value => !_.isNaN(value)).value())),
                    errorMessage: __('Value type is set as Integer, but the value entered is not a number')}),
      ],
    };
  }

  // Run validations across each dialog elements.
  dialogIsValid(dialogData) {
    this.invalid.message = null;

    const validate = (item, description) => ((fn) => {
      let validation = fn(item);
      if (! validation.status) {
        Object.assign(this.invalid, {
          item,
          description,
          message: validation.errorMessage,
        });
      }
      return validation.status;
    });

    const describeDialog = (dialog) => dialog.label ? sprintf(__('Dialog %s'), dialog.label) : __('Unnamed Dialog');
    const describeTab = (tab) => tab.label ? sprintf(__('Tab %s'), tab.label) : __('Unnamed Tab');
    const describeGroup = (group) => group.label ? sprintf(__('Section %s'), group.label) : __('Unnamed Section');
    const describeField = (field) => field.label ? sprintf(__('Field %s'), field.label) : __('Unnamed Field');

    const validateDialog = (dialog) => _.every(this.validators.dialog, validate(dialog, describeDialog(dialog)));
    const validateTab = (tab) => _.every(this.validators.tabs, validate(tab, describeTab(tab)));
    const validateGroup = (group) => _.every(this.validators.groups, validate(group, describeGroup(group)));
    const validateField = (field) => _.every(this.validators.fields, validate(field, describeField(field)));

    return _.every(dialogData, dialog =>
      validateDialog(dialog) &&
      _.every(dialog.dialog_tabs, tab =>
        validateTab(tab) &&
        _.every(tab.dialog_groups, group =>
          validateGroup(group) &&
          _.every(group.dialog_fields, field =>
            validateField(field)
          )
        )
      )
    );
  }
}
