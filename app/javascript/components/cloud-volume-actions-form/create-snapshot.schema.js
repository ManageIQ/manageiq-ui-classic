import { componentTypes } from '@data-driven-forms/react-form-renderer';

function createSnapshotSchema() {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    id: 'basic-information',
    name: 'basic-information',
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        id: 'name',
        name: 'name',
        label: __('Snapshot Name'),
        maxLength: 50,
      }],
  }];
  return { fields };
}

export default createSnapshotSchema;
