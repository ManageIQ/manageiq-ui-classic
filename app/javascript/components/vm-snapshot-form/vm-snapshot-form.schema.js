import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (hideName, showMemory, descriptionRequired) => {
  const nameField = {
    component: componentTypes.TEXT_FIELD,
    id: 'name',
    name: 'name',
    label: __('Name'),
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
      message: __('Required'),
    }],
  };

  const memoryField = {
    component: componentTypes.SWITCH,
    id: 'snap_memory',
    name: 'snap_memory',
    label: __('Snapshot VM memory'),
    onText: __('Yes'),
    offText: __('No'),
  };

  const fields = [
    ...(hideName ? [] : [nameField]),
    {
      component: componentTypes.TEXTAREA_FIELD,
      id: 'description',
      name: 'description',
      label: __('Description'),
      isRequired: descriptionRequired,
      validate: descriptionRequired ? [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }] : [],
    },
    ...(showMemory ? [memoryField] : []),
  ];


  return { fields };
};

export default createSchema;
