import { componentTypes } from '@@ddf';
import {
  textFieldComponent,
  textAreaComponent,
  switchComponent,
  selectComponent,
  fieldArrayComponent,
  datePickerComponent,
  dateTimePickerComponent,
  automateEntryPointComponent,
  workflowEntryPointComponent,
} from './fields.schema';

// tab - each tab in the edit field modal
// initialData - all information regarding the underlying component
const fields = (tab, initialData, onChange) => tab.fields.map((item) => {
  switch (item.field) {
    case componentTypes.TEXT_FIELD:
      return textFieldComponent(item);
    case componentTypes.TEXTAREA:
      return textAreaComponent(item);
    case componentTypes.SWITCH:
      return switchComponent(item);
    case componentTypes.FIELD_ARRAY:
      return fieldArrayComponent(item);
    case componentTypes.SELECT:
      return selectComponent(item, initialData);
    case componentTypes.DATE_PICKER:
      return datePickerComponent(item);
    case 'date-time-picker':
      return dateTimePickerComponent(item, initialData, onChange);
    case 'embedded-automate-entry-point':
      return automateEntryPointComponent(item, initialData, onChange);
    case 'embedded-workflow-entry-point':
      return workflowEntryPointComponent(item, initialData, onChange);
    default:
      return null;
  }
});

const tabs = (configuration, initialData, onChange) => configuration.map((tab, tabIndex) => (
  {
    name: tabIndex,
    title: tab.name,
    description: tab.name,
    fields: fields(tab, initialData, onChange),
  }));

export const createSchema = (configuration, initialData, onChange) => ({
  fields: [
    {
      component: 'tabs',
      name: 'tabs',
      fields: tabs(configuration, initialData, onChange),
    },
  ],
});
