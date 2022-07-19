const getButtonTypes = () => API.options('/api/custom_buttons')
  .then((response) => Object.keys(response.data.custom_button_types)
    .map((key) => ({ value: key, label: response.data.custom_button_types[key] })));

const getRoles = (setState) => API.get('/api/roles?expand=resources&attributes=name')
  .then((response) => {
    const roles = [];
    response.resources.forEach((role) => {
      roles.push({ label: role.name, value: role.name });
    });
    setState((state) => ({
      ...state,
      roles,
    }));
  });

const getServiceDialogs = (setState) => API.get('/api/service_dialogs?expand=resources&attributes=label')
  .then((response) => {
    const serviceDialogs = [];
    response.resources.forEach((dialog) => {
      serviceDialogs.push({ label: dialog.label, value: dialog.id });
    });
    setState((state) => ({
      ...state,
      serviceDialogs,
    }));
  });

const getInitialValues = (recId, setState) => {
  if (recId) {
    API.get(`/api/custom_buttons/${recId}?attributes=resource_action,uri_attributes`)
      .then((initialValues) => {
        if (initialValues.options.button_type === 'ansible_playbook') {
          initialValues.uri_attributes.request = 'create';
          if (initialValues.uri_attributes) {
            if (initialValues.uri_attributes.hosts === 'localhost') {
              initialValues.inventory_type = 'localhost';
            } else if (initialValues.uri_attributes.hosts === 'vmdb_object') {
              initialValues.inventory_type = 'vmdb_object';
            } else {
              initialValues.inventory_type = 'manual';
              initialValues.hosts = initialValues.uri_attributes.hosts;
            }
          }
        }
        if (initialValues.visibility.roles && initialValues.visibility.roles[0] !== '_ALL_') {
          initialValues.available_roles = initialValues.visibility.roles;
          initialValues.visibility = { roles: 'role' };
        }
        setState((state) => ({
          ...state,
          initialValues,
          buttonIcon: (initialValues && initialValues.options) ? initialValues.options.button_icon : '',
          isLoading: false,
        }));
      });
  } else {
    setState({
      buttonIcon: 'ff ff-action',
      initialValues: {
        inventory_type: 'localhost',
        options: {
          button_icon: 'ff ff-action',
          button_color: '#000000',
          button_type: 'default',
          display: true,
          display_for: 'single',
          submit_how: 'one',
        },
        resource_action: {
          ae_message: 'create',
          ae_instance: 'Request',
        },
        visibility: {
          roles: ['_ALL_'],
        },
      },
    });
  }
};

const prepareSubmitData = (values, recId, appliesToClass, appliesToId, initialValues, buttonIcon) => {
  const submitValues = values;
  submitValues.applies_to_class = appliesToClass;
  if (recId) {
    submitValues.applies_to_id = initialValues.applies_to_id;
  } else {
    submitValues.applies_to_id = appliesToId;
  }

  if (submitValues.options) {
    submitValues.options = {
      ...submitValues.options,
      button_icon: buttonIcon,
    };
  }

  if (values.available_roles) {
    submitValues.visibility.roles = [];
    if (recId && values.available_roles.length > 0 && values.available_roles[0].value === undefined) {
      values.available_roles = values.available_roles.map((role) => ({ label: role, value: role }));
    }
    values.available_roles.forEach((role) => {
      submitValues.visibility.roles.push(role.value);
      delete submitValues.available_roles;
    });
  } else {
    submitValues.visibility.roles = ['_ALL_'];
  }
  if (values.resource_action && values.resource_action.dialog_id) {
    submitValues.resource_action.dialog_id = values.resource_action.dialog_id;
  }

  submitValues.resource_action = {
    ...submitValues.resource_action,
    ae_class: 'PROCESS',
    ae_namespace: 'SYSTEM',
  };

  if (values.options.button_type === 'ansible_playbook') {
    submitValues.uri_attributes = values.uri_attributes;
    submitValues.uri_attributes.request = 'Order_Ansible_Playbook';
    if (values.inventory_type === 'vmdb_object') {
      submitValues.uri_attributes.hosts = 'vmdb_object';
    } else if (values.inventory_type === 'manual') {
      submitValues.uri_attributes.hosts = values.hosts;
    } else if (values.inventory_type === 'localhost') {
      submitValues.uri_attributes.hosts = 'localhost';
    }
    delete submitValues.inventory_type;
    delete submitValues.hosts;
  }
  return submitValues;
};

export {
  getButtonTypes, getRoles, getServiceDialogs, getInitialValues, prepareSubmitData,
};
