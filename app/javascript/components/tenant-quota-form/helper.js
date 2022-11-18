const GIGABYTE = 1024 * 1024 * 1024;

// Creates the Rows of the MiqDataTable
export const createRows = (initialValues, enforced, setEnforced, values, setValues, setDisabled, setChanged, invalid, setInvalid) => {
  /* Determines whether the save button should be disabled
    based on whether the form has changed or if an inputted value is invalid */
  const isDisabled = () => {
    let fresh = true;
    if (Object.values(invalid).every((value) => value.bool === false)
      && !Object.values(enforced).some((value, index) => (value === false && values[index] === ''))) {
      // eslint-disable-next-line no-restricted-syntax
      for (const key in enforced) {
        if (initialValues.enforced[key] !== enforced[key] || initialValues.values[key] !== values[key]) {
          fresh = false;
          break;
        }
      }
    }
    setDisabled(fresh);
  };

  /* Determines whether the reset button should be disabled
    based on whether the form has changed */
  const isChanged = () => {
    let fresh = true;
    // eslint-disable-next-line no-restricted-syntax
    for (const key in enforced) {
      if (initialValues.enforced[key] !== enforced[key] || initialValues.values[key] !== values[key]) {
        fresh = false;
        break;
      }
    }
    setChanged(fresh);
  };

  /* Determines whether the "value" text input of a particular row should be readonly
    based on the value of the enforced toggle */
  const enforce = (index) => {
    enforced[index] = !enforced[index];

    if (enforced[index] === true) {
      values[index] = '';
      invalid[index].bool = false;
      Array.from(document.querySelectorAll('.quota-table-input')).forEach((input, key) => {
        if (key === index) {
          input.value = '';
        }
      });
      setValues(() => ({ ...values }));
      setInvalid(() => ({ ...invalid }));
    }

    setEnforced(() => ({ ...enforced }));
    isDisabled();
    isChanged();
  };

  // Updates the value of a particular row to state
  const updateValues = (index, target) => {
    values[index] = target.value;
    setValues(() => ({ ...values }));
    isDisabled();
    isChanged();
  };

  // Validates text input by ensuring no negative numbers are submitted or non-integer values when unit = fixnum
  const validate = (index, value) => {
    if (values[index] !== '') {
      if (values[index] <= 0) {
        invalid[index].bool = true;
      } else if (!Number.isInteger(parseFloat(values[index])) && value.unit === 'fixnum') {
        invalid[index].bool = true;
      } else {
        invalid[index].bool = false;
      }
    } else {
      invalid[index].bool = false;
    }

    setInvalid(() => ({ ...invalid }));
    isDisabled();
    isChanged();
  };

  // The rows of the table are created here (quotas)
  const quotas = Object.values(initialValues.data.quota_definitions);

  quotas.forEach((value, index, array) => {
    array[index] = {
      id: index.toString(),
      Enforced: {
        is_toggle: true,
        text: null,
        labelA: __('Off'),
        labelB: __('On'),
        title: __('Enforce a Value'),
        alt: __('Enforce a Value'),
        ontoggle: () => enforce(index),
        toggled: !enforced[index],
      },
      Description: {
        text: value.description,
      },
      Value: {
        is_textinput: true,
        className: 'quota-table-input',
        text: null,
        placeholder: __('Not Enforced'),
        value: values[index],
        invalid: invalid[index].bool,
        invalidText: invalid[index].text,
        type: 'number',
        readonly: enforced[index],
        onchange: ({ target }) => {
          updateValues(index, target);
          validate(index, value);
        },
      },
      Units: {
        text: value.text_modifier,
      },
    };
  });

  return quotas;
};

// Manipulates the data retrived from the API before it's saved to state in the useEffect
export const setupForm = (initialValues, resources, name) => {
  const modifiedInitialValues = {
    name, values: [], enforced: [], invalid: [], ...initialValues,
  };

  Object.keys(modifiedInitialValues.data.quota_definitions).forEach((key, index) => {
    for (let x = 0; x < resources.length; x += 1) {
      if (resources[x].name === key) {
        modifiedInitialValues.data.quota_definitions[key] = {
          ...modifiedInitialValues.data.quota_definitions[key],
          value: resources[x].value,
          id: resources[x].id,
          href: resources[x].href,
        };
        break;
      }
    }

    modifiedInitialValues.enforced[index] = !!!modifiedInitialValues.data.quota_definitions[key].value;
    if (modifiedInitialValues.data.quota_definitions[key].unit === 'bytes') {
      modifiedInitialValues.invalid[index] = { bool: false, text: __('Value must be a positive number') };
      modifiedInitialValues.values[index] = modifiedInitialValues.data.quota_definitions[key].value
        ? (modifiedInitialValues.data.quota_definitions[key].value / GIGABYTE).toString() : '';
    } else {
      modifiedInitialValues.invalid[index] = { bool: false, text: __('Value must be a positive integer') };
      modifiedInitialValues.values[index] = modifiedInitialValues.data.quota_definitions[key].value
        ? modifiedInitialValues.data.quota_definitions[key].value.toString() : '';
    }
  });

  return modifiedInitialValues;
};

// Takes all the quotas to be created/edited/deleted and seperates them into three different API calls
export const prepareData = (initialValues = {}, values = {}) => {
  const quotasToCreate = { action: 'create', resources: [] };
  const quotasToEdit = { action: 'edit', resources: [] };
  const quotasToDelete = { action: 'delete', resources: [] };

  Object.keys(initialValues.data.quota_definitions).forEach((key, index) => {
    let value = values[index];

    if (value === '') {
      if (initialValues.data.quota_definitions[key].id !== undefined) {
        quotasToDelete.resources.push({ href: initialValues.data.quota_definitions[key].href });
      }
    // eslint-disable-next-line no-empty
    } else if (value === initialValues.values[index]) {
    } else {
      if (initialValues.data.quota_definitions[key].unit === 'bytes') {
        value = parseFloat(value) * GIGABYTE;
      } else if (initialValues.data.quota_definitions[key].unit === 'fixnum') {
        value = parseFloat(value);
      }

      if (initialValues.data.quota_definitions[key].id === undefined) {
        quotasToCreate.resources.push({ name: key, value });
      } else {
        quotasToEdit.resources.push({ href: initialValues.data.quota_definitions[key].href, value });
      }
    }
  });

  return { quotasToCreate, quotasToEdit, quotasToDelete };
};
