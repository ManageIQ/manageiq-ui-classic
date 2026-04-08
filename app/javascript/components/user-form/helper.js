const areGroupsEqual = (initialValues, selectedGroups = []) => {
  const selectedGroupsCopy = [...selectedGroups];
  selectedGroupsCopy.sort();
  const initialGroupValuesCopy = [...initialValues.groups];
  initialGroupValuesCopy.sort();
  if (selectedGroupsCopy.length !== initialGroupValuesCopy.length) {
    return false;
  }
  return selectedGroupsCopy.every((group, index) => group === initialGroupValuesCopy[index]);
};

export const passwordValidation = (initialValues, id, editMode, values, setState, selectedGroups) => {
  if (values.groups === undefined) {
    if (selectedGroups.length > 0) {
      setState((state) => ({
        ...state,
        selectedGroups: [],
      }));
    }
  }
  const errors = {};
  const groupIds = [];
  if (values.groups) {
    values.groups.forEach((group) => {
      if (group.value) {
        groupIds.push(group.value);
      } else {
        groupIds.push(group);
      }
    });
  }
  if (!editMode && !!id) {
    values.password = undefined;
    values.confirmPassword = undefined;
    if (values.name === initialValues.name
            && values.userid === initialValues.userid
            && values.email === initialValues.email
            && areGroupsEqual(initialValues, groupIds)) {
      errors.confirmPassword = '';
    }
  }

  if (values.password === undefined) {
    if (!!id && editMode) {
      errors.password = 'Required';
    }
  }

  if ((editMode || !id) && values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Password/Verify Password do not match';
  }

  return errors;
};
