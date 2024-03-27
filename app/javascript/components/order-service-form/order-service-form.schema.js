import { componentTypes } from '@@ddf';

const showDateErrorFields = (fields) => {
  let invalidFields;
  fields.forEach((field) => {
    if (invalidFields) {
      invalidFields = `${invalidFields}, ${field}`;
    } else {
      invalidFields = field;
    }
  });
  return invalidFields;
};

const createSchema = (fields, showDateError, activeTab) => ({
  fields: [
    {
      component: componentTypes.TABS,
      name: 'tabs',
      fields,
      selected: activeTab,
    },
    ...(showDateError.length > 0 ? [
      {
        id: 'dateWarning',
        component: componentTypes.PLAIN_TEXT,
        name: 'dateWarning',
        label: __(`Invalid date selected for ${showDateErrorFields(showDateError)}. Please select a future date.`),
      },
    ] : []),
  ],
});

export default createSchema;
