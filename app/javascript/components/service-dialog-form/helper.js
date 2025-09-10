import PropTypes from 'prop-types';

export const dynamicFieldDataProps = PropTypes.shape({
  section: PropTypes.shape({
    tabId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    fields: PropTypes.arrayOf(PropTypes.any).isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  field: PropTypes.shape({ componentId: PropTypes.number }).isRequired,
  fieldPosition: PropTypes.number.isRequired,
});

export const selectedTab = (tabs, tabId) => tabs.find((tab) => tab.tabId === tabId);

export const SD_ACTIONS = {
  tab: {
    edit: 'tabEdit',
    delete: 'tabDelete',
  },
  section: {
    edit: 'sectionEdit',
    delete: 'sectionDelete',
  },
  field: {
    edit: 'fieldEdit',
    delete: 'fieldDelete',
  },
  onDragOverListener: 'onDragOverListener',
  onDrop: 'onDrop',
  onDragEnterSection: 'onDragEnterSection',
  onDragEnterField: 'onDragEnterField',
  onDragStartField: 'onDragStartField',
  onDragStartSection: 'onDragStartSection',
  onDragEnterTab: 'onDragEnterTab',
  onDragStartTab: 'onDragStartTab',
};

/** Function to drop a field after its been dragged within a section */
export const dropField = (section, { sectionId, fieldPosition }, dragEnterItem) => {
  if (section.sectionId === sectionId) {
    // makes sure that the dragged field stays in the same section.
    const draggedField = section.fields.find((_field, index) => index === fieldPosition);
    const otherFields = section.fields.filter((_field, index) => index !== fieldPosition);
    otherFields.splice(dragEnterItem.fieldPosition, 0, draggedField);
    section.fields = otherFields;
  }
};

/** Function to drop a section after its been dragged */
export const dropSection = (tab, { sectionId }, dragEnterItem) => {
  const { sections } = tab;

  const fromIndex = sections.findIndex((sec) => sec.sectionId === sectionId);
  const toIndex = sections.findIndex((sec) => sec.sectionId === dragEnterItem.section.sectionId);

  // If either index is not found, do nothing
  if (fromIndex === -1 || toIndex === -1) return;

  // Remove the dragged section
  const [draggedSection] = sections.splice(fromIndex, 1);

  // Insert at the correct position
  sections.splice(toIndex, 0, draggedSection);
};

export const dropTab = (formFields, { tabId }, dragEnterItem) => {
  // const { sections } = tab;

  const fromIndex = formFields.findIndex((tab) => tab.tabId === tabId);
  const toIndex = formFields.findIndex((tab) => tab.tabId === dragEnterItem.tab.tabId);

  // If either index is not found, do nothing
  if (fromIndex === -1 || toIndex === -1) return;

  // Remove the dragged tab
  const [draggedTab] = formFields.splice(fromIndex, 1);

  // Insert at the correct position
  formFields.splice(toIndex, 0, draggedTab);
};

/** Function to drop a component after its been dragged */
export const dropComponent = (section, { componentId }) => {
  // Create a proper field object based on the component type
  let fieldData = { componentId };
  
  // Add default properties based on component type
  switch(componentId) {
    case 1: // Text Box
      fieldData = {
        ...fieldData,
        type: 'DialogFieldTextBox',
        dataType: 'string',
        name: `text_box_${Date.now()}`,
        label: 'Text Box',
        value: '',
        position: section.fields.length,
        visible: true,
        required: false,
        readOnly: false
      };
      break;
    case 2: // Text Area
      fieldData = {
        ...fieldData,
        type: 'DialogFieldTextAreaBox',
        dataType: 'string',
        name: `text_area_${Date.now()}`,
        label: 'Text Area',
        value: '',
        position: section.fields.length,
        visible: true,
        required: false,
        readOnly: false
      };
      break;
    case 3: // Check Box
      fieldData = {
        ...fieldData,
        type: 'DialogFieldCheckBox',
        dataType: 'boolean',
        name: `check_box_${Date.now()}`,
        label: 'Check Box',
        checked: false,
        position: section.fields.length,
        visible: true,
        required: false,
        readOnly: false
      };
      break;
    case 4: // Dropdown
      fieldData = {
        ...fieldData,
        type: 'DialogFieldDropDownList',
        dataType: 'string',
        name: `dropdown_${Date.now()}`,
        label: 'Dropdown',
        items: [
          { id: '1', text: 'Option 1', value: '1' },
          { id: '2', text: 'Option 2', value: '2' }
        ],
        position: section.fields.length,
        visible: true,
        required: false,
        readOnly: false
      };
      break;
    case 5: // Radio Button
      fieldData = {
        ...fieldData,
        type: 'DialogFieldRadioButton',
        dataType: 'string',
        name: `radio_button_${Date.now()}`,
        label: 'Radio Button',
        items: [
          { id: '1', text: 'Option 1', value: '1' },
          { id: '2', text: 'Option 2', value: '2' }
        ],
        position: section.fields.length,
        visible: true,
        required: false,
        readOnly: false
      };
      break;
    case 6: // Datepicker
      fieldData = {
        ...fieldData,
        type: 'DialogFieldDateControl',
        dataType: 'string',
        name: `date_picker_${Date.now()}`,
        label: 'Date Picker',
        value: new Date().toISOString(),
        position: section.fields.length,
        visible: true,
        required: false,
        readOnly: false
      };
      break;
    case 7: // Timepicker
      fieldData = {
        ...fieldData,
        type: 'DialogFieldDateTimeControl',
        dataType: 'string',
        name: `time_picker_${Date.now()}`,
        label: 'Time Picker',
        value: new Date().toISOString(),
        position: section.fields.length,
        visible: true,
        required: false,
        readOnly: false
      };
      break;
    case 8: // Tag Control
      fieldData = {
        ...fieldData,
        type: 'DialogFieldTagControl',
        dataType: 'string',
        name: `tag_control_${Date.now()}`,
        label: 'Tag Control',
        position: section.fields.length,
        visible: true,
        required: false,
        readOnly: false
      };
      break;
    default:
      break;
  }
  
  console.log('Adding field to section:', fieldData);
  section.fields.push(fieldData);
};

// Shapes for each service dialog components as needed
const textInputShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
});

const textAreaShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
});

const checkboxShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  required: PropTypes.bool,
});

const dropdownShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  // multiselect: PropTypes.bool,
});

const radioButtonShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
});

const datePickerShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
});

const dateTimePickerShape = PropTypes.shape({
  label: PropTypes.string,
  value: PropTypes.string,
});

const tagControlShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
});

export const SD_PROP_SHAPES = {
  textbox: textInputShape,
  textarea: textAreaShape,
  checkbox: checkboxShape,
  dropdown: dropdownShape,
  radiobutton: radioButtonShape,
  datePicker: datePickerShape,
  dateTimePicker: dateTimePickerShape,
  tagControl: tagControlShape,
};

/**
 * Helper function to extract field values from API data
 * @param {Object} field - The field data from the API
 * @returns {Object} - The standardized field values
 */
export const getFieldValues = (field) => {
  console.log('Getting field values for:', field);
  
  // Common properties for all field types
  const commonProps = {
    type: field.type || '',
    name: field.name || '',
    label: field.label || '',
    position: field.position || 0,
    visible: field.visible !== undefined ? field.visible : true,
    required: field.required || false,
    readOnly: field.read_only || false,
    dynamic: field.dynamic || false,
  };
  
  // Type-specific properties
  switch (field.type) {
    case 'DialogFieldTextBox':
      return {
        ...commonProps,
        value: field.default_value || field.value || '',
      };
      
    case 'DialogFieldTextAreaBox':
      return {
        ...commonProps,
        value: field.default_value || field.value || '',
      };
      
    case 'DialogFieldCheckBox':
      return {
        ...commonProps,
        checked: field.default_value || field.value || false,
      };
      
    case 'DialogFieldDropDownList':
      return {
        ...commonProps,
        items: field.values ? field.values.map(([value, description]) => ({ value, description })) : [],
        multiselect: field.force_multi_value || false,
        value: field.default_value || field.value || [],
        sortBy: field.options && field.options.sort_by ? field.options.sort_by : 'description',
        sortOrder: field.options && field.options.sort_order ? field.options.sort_order : 'ascending',
      };
      
    case 'DialogFieldRadioButton':
      return {
        ...commonProps,
        items: field.values ? field.values.map(([value, description]) => ({ value, description })) : [],
        value: field.default_value || field.value || '',
      };
      
    case 'DialogFieldDateControl':
      return {
        ...commonProps,
        value: field.default_value || field.value || new Date().toISOString(),
        showPastDates: field.options && field.options.show_past_dates ? field.options.show_past_dates : false,
      };
      
    case 'DialogFieldDateTimeControl':
      return {
        ...commonProps,
        value: field.default_value || field.value || new Date().toISOString(),
        showPastDates: field.options && field.options.show_past_dates ? field.options.show_past_dates : false,
      };
      
    case 'DialogFieldTagControl':
      return {
        ...commonProps,
        categoryId: field.options && field.options.category_id ? field.options.category_id : '',
        categoryName: field.options && field.options.category_name ? field.options.category_name : '',
        singleValue: field.options && field.options.category_single_value ? field.options.category_single_value : false,
      };
      
    default:
      return commonProps;
  }
};

// in the case of Tag Control component
const getCategoryInfo = ({
  selectedCategory: {
    data: {
      id, name, description, singleValue,
    },
  },
}) => ({
  category_id: id,
  category_name: name,
  category_description: description,
  category_single_value: singleValue,
});

const getOptions = (field) => {
  const categoryInfo = (field.selectedCategory && getCategoryInfo(field)) || {};
  const obj = {
    protected: field.protected,
    sort_by: field.sortBy,
    sort_order: field.sortOrder,
    force_single_value: field.singleValue,
    force_multi_value: field.multiselect,
    show_past_dates: field.showPastDates,
    ...categoryInfo,
  };

  // Filter out keys with empty strings, undefined values, and null values
  const result = Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => (value !== undefined && value !== ''))
  );

  return result;
};

const getResourceAction = () => ({
  resource_type: 'DialogField',
  ae_attributes: {},
});

const getDefaultValue = (field) => {
  switch (field.type) {
    case 'DialogFieldCheckBox':
      return field.checked;
    case 'DialogFieldDateControl':
      return new Date(field.value).toISOString();
    case 'DialogFieldDateTimeControl': {
      return new Date(field.value).toISOString();
    }
    default:
      return field.value;
  }
};

const getValues = (field) => field.items && field.items.map((item) => [item.value, item.text]);

const parseFieldsInfo = (fields) => {
  const result = fields.map((field) => {
    const obj = {
      name: field.name,
      description: '',
      type: field.type,
      data_type: field.dataType,
      notes: '',
      notes_display: '',
      // display: 'edit',
      display_method: '',
      display_method_options: {},
      required: field.required || false,
      required_method: '',
      required_method_options: {},
      default_value: getDefaultValue(field),
      values: getValues(field),
      values_method: '',
      values_method_options: {},
      options: getOptions(field),
      label: field.label,
      dialog_group_id: '',
      position: field.position,
      reconfigurable: field.reconfigurable || false,
      dynamic: field.dynamic || false,
      show_refresh_button: field.showRefresh || false,
      load_values_on_init: field.loadOnInit || false,
      read_only: field.readOnly || false,
      auto_refresh: false,
      trigger_auto_refresh: false,
      visible: field.visible || false,
      validator_type: field.validation || false,
      validator_rule: field.validatorRule,
      validator_message: field.validatorMessage,
      resource_action: getResourceAction(),
    };
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => (value !== undefined && value !== ''))
    );
  });
  return result;
};

const getFieldsInfo = (fields) => {
  const formattedFields = parseFieldsInfo(fields);
  return formattedFields;
};

// get details on Sections
const getSectionsInfo = (sections) => sections.map((section) => ({
  label: section.title,
  position: section.order,
  dialog_fields: getFieldsInfo(section.fields),
}));

const getTabsInfo = (tabs) => {
  console.log("Tabs: ", tabs);
  return tabs
    .map((tab) => ({
      label: tab.name,
      position: tab.tabId,
      dialog_groups: getSectionsInfo(tab.sections),
    }))
    .filter((tabInfo) => tabInfo.dialog_groups.length > 0); // Filter out objects with empty dialog_groups
};

const getDialogInfo = (data) => ({
  label: data.label,
  description: data.description,
  buttons: 'submit,cancel',
  dialog_tabs: getTabsInfo(data.formFields),
});

// get payload for create
const payloadForSave = (data) => ({
  action: 'create',
  resource: getDialogInfo(data),
});

export const formattedCatalogPayload = (data) => {
  const payload = payloadForSave(data);
  return payload;
};

// Get the formatted current date
export const getCurrentDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

// Get the current time and period
export const getCurrentTimeAndPeriod = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const currentPeriod = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 0 hours to 12 in 12-hour format
  return { time: `${hours}:${minutes}`, period: currentPeriod };
};

export const uniqueNameValidator = (usedNames, currentName) => (value) => {
  if (!value) return undefined;

  const trimmed = value.trim().toLowerCase();

  const isDuplicate = usedNames
    .filter((name) => name.toLowerCase() !== currentName.toLowerCase())
    .map((name) => name.toLowerCase())
    .includes(trimmed);

  return isDuplicate ? __('Name must be unique.') : undefined;
};
