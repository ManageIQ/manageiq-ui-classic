import { componentTypes } from '@data-driven-forms/react-form-renderer';

function createSchema() {
  const fields = [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      label: __('Name'),
      maxLength: 40,
    }];
  return { fields };
}

export default createSchema;
