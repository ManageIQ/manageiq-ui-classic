import { componentTypes } from '@@ddf';
import { DIALOG_FIELDS, SERVICE_DIALOG_FROM } from '../order-service-form/order-service-constants';
import {
  buildTextBox,
  buildTextAreaBox,
  buildCheckBox,
  buildDropDownList,
  buildTagControl,
  buildDateControl,
  buildTimeControl,
  buildRadioButtons,
  buildRefreshButton,
} from './viewFields.schema';

const dates = [];
const showPastDates = [];
const showPastDatesFieldErrors = [];

const formatDateControl = (field) => {
  dates.push(field.name);
  if (field.default_value === '' || !field.default_value) {
    const today = new Date();
    field.default_value = today.toISOString();
  }
  if (field.options.show_past_dates) {
    showPastDates.push(field.name);
  } else {
    showPastDatesFieldErrors.push({ name: field.name, label: field.label });
  }
};

const formatTimeControl = (field) => {
  let newDate = '';
  if (field.default_value === '' || !field.default_value) {
    newDate = new Date();
    field.default_value = newDate.toISOString();
  } else {
    newDate = new Date(field.default_value);
  }
  if (field.options.show_past_dates) {
    showPastDates.push(field.name);
  } else {
    showPastDatesFieldErrors.push({ name: field.name, label: field.label });
  }
  return newDate;
};

// TODO: Can be reused
/** Function to build a field inside a section. */
const sectionField = (group, componentItem, index) => ({
  component: componentTypes.SUB_FORM,
  id: `${group.id.toString()}_row`,
  name: `section-field-${index}`,
  fields: componentItem,
  className: 'order-form-row',
  key: index,
});

export const buildOrderServiceFieldComponent = (serviceData) => {
  const { field, from } = serviceData;
  const isReadOnly = ([SERVICE_DIALOG_FROM.request, SERVICE_DIALOG_FROM.customization].includes(from));
  const data = { ...serviceData, isReadOnly, from };

  switch (field.type) {
    case DIALOG_FIELDS.textBox:
      return buildTextBox(data);
    case DIALOG_FIELDS.textArea:
      return buildTextAreaBox(data);
    case DIALOG_FIELDS.checkBox:
      return buildCheckBox(data);
    case DIALOG_FIELDS.dropDown:
      return buildDropDownList(data);
    case DIALOG_FIELDS.tag:
      return buildTagControl(data);
    case DIALOG_FIELDS.date:
    {
      formatDateControl(field);
      return buildDateControl(data);
    }
    case DIALOG_FIELDS.dateTime:
    {
      const dateTime = formatTimeControl(field);
      return buildTimeControl({ ...data, dateTime });
    }
    case DIALOG_FIELDS.radio:
      return buildRadioButtons(data);
    default:
      return {};
  }
};

export const buildOrderServiceFields = (response, initialValues, from) => {
  const dialogTabs = [];
  response.content[0].dialog_tabs.forEach((tab, tabIndex) => {
    const dialogSections = [];
    tab.dialog_groups.forEach((group, _groupIndex) => {
      const dialogFields = [];
      group.dialog_fields.forEach((field) => {
        const fieldData = [
          buildOrderServiceFieldComponent({ field, initialValues, from }),
          buildRefreshButton(field, tabIndex),
        ];
        dialogFields.push(fieldData);
      });
      const sectionData = {
        component: componentTypes.SUB_FORM,
        id: group.id,
        name: group.label,
        title: group.label,
        className: 'section-data',
        fields: dialogFields.map((item, index) => sectionField(group, item, index)),
      };
      dialogSections.push(sectionData);
    });
    const tabData = {
      name: tab.label,
      title: tab.label,
      fields: dialogSections,
    };
    dialogTabs.push(tabData);
  });
  return dialogTabs;
};
