import { componentTypes, validatorTypes } from '@@ddf';

/** Namespace path field schema */
const namespacePathField = () => ({
  component: componentTypes.TEXT_FIELD,
  id: 'namespacePath',
  name: 'namespacePath',
  label: __('Fully Qualified Name'),
  isDisabled: true,
});

/** Name field schema */
const nameField = (readOnly) => ({
  component: componentTypes.TEXT_FIELD,
  id: 'name',
  name: 'name',
  label: __('Name'),
  maxLength: 128,
  validate: [{ type: validatorTypes.REQUIRED }],
  isRequired: true,
  isDisabled: readOnly,
});

/** Description field schema */
const descriptionField = (readOnly) => ({
  component: componentTypes.TEXT_FIELD,
  id: 'description',
  name: 'description',
  label: __('Description'),
  maxLength: 128,
  validate: [{ type: validatorTypes.REQUIRED }],
  isDisabled: readOnly,
});

/** Enabled field schema */
const enabledField = () => ({
  component: componentTypes.CHECKBOX,
  id: 'enabled',
  name: 'enabled',
  label: __('Enabled'),
});

/** Function to generate the form fields based on conditions */
const generateFields = (domain, namespacePath, nameReadOnly, descReadOnly) => {
  const fields = [];
  if (!domain) { fields.push(namespacePathField(namespacePath)); }
  fields.push(nameField(nameReadOnly));
  fields.push(descriptionField(descReadOnly));
  if (domain) { fields.push(enabledField()); }
  return fields;
};

const createSchema = (_type, domain, namespacePath, nameReadOnly, descReadOnly) => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      id: 'datastore-form-wrapper',
      name: 'datastore-form-wrapper',
      title: __('Info'),
      fields: generateFields(domain, namespacePath, nameReadOnly, descReadOnly),
    }],
});

export default createSchema;
