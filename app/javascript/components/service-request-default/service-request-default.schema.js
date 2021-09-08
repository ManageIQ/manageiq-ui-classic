import { componentTypes } from '@@ddf';

const findUser = (searchHere) => {
  if (searchHere.users.length > 1) {
    return [{
      label: searchHere.selectedUser.charAt(0).toUpperCase() + searchHere.selectedUser.slice(1),
      value: searchHere.selectedUser,
    }];
  } if (searchHere.users.length === 1) {
    return [searchHere.users[0]];
  }
  return [{
    label: __('None Available'),
    value: 'none_available',
  }];
};

const buildStatesComponents = (options) => {
  const initialValuesFields = [];
  const optionsFields = [];
  options.states.forEach((states) => {
    initialValuesFields.push(states.value);
    optionsFields.push({
      value: states.value,
      label: states.label,
    });
  });
  const checkboxesComponent = [{
    component: componentTypes.CHECKBOX,
    id: 'approvalStateCheckboxes',
    name: 'approvalStateCheckboxes',
    label: __('Approval State:'),
    isRequired: true,
    initialValue: initialValuesFields,
    options: optionsFields,
  }];
  return checkboxesComponent;
};

const createSchema = (miqRequestInitialOptions) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'selectedUser',
      name: 'selectedUser',
      label: __('Requester:'),
      isRequired: true,
      options: findUser(miqRequestInitialOptions),
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'approval_state',
      name: 'approval_state',
      fields: buildStatesComponents(miqRequestInitialOptions),
    },
    {
      component: componentTypes.SELECT,
      id: 'types',
      name: 'types',
      label: __('Type:'),
      isRequired: true,
      options: miqRequestInitialOptions.types,
    },
    {
      component: componentTypes.SELECT,
      id: 'selectedPeriod',
      name: 'selectedPeriod',
      label: __('Request Date:'),
      isRequired: true,
      initialValue: miqRequestInitialOptions.selectedPeriod,
      options: miqRequestInitialOptions.timePeriods,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'reasonText',
      name: 'reasonText',
      label: __('Reason:'),
      maxLength: 128,
    },
  ],
});

export default createSchema;
