import { API } from '../../http_api';

const getButtonTypes = () => API.options('/api/custom_buttons')
  .then((response) => Object.keys(response.data.custom_button_types)
    .map((key) => ({ value: key, label: response.data.custom_button_types[key] })));

const getButtonFormData = (url = '/miq_ae_customization/ab_button_form_data') => http.get(url)
  .then((data) => ({
    distinct_instances: (data.distinct_instances || []).map((name) => ({ value: name, label: name })),
    ansible_playbooks: (data.ansible_playbooks || []).map((name) => ({ value: name, label: name })),
  }));

const getRoles = () => API.get('/api/roles?expand=resources&attributes=name')
  .then((response) => response.resources.map((role) => ({ label: role.name, value: role.name })));

const getServiceDialogs = () => API.get('/api/service_dialogs?expand=resources&attributes=label')
  .then((response) => response.resources.map((dialog) => ({ label: dialog.label, value: dialog.id })));

const getInitialValues = (recId) => {
  if (!recId) {
    return Promise.resolve({
      inventory_type: 'localhost',
      attribute_pairs: [],
      options: {
        button_icon: 'ff ff-action',
        button_color: '#000000',
        button_type: 'default',
        display: true,
        display_for: 'single',
        submit_how: 'one',
        open_url: false,
      },
      resource_action: {
        ae_message: 'create',
        ae_instance: 'Request',
      },
      visibility: { roles: ['_ALL_'] },
    });
  }

  const attrs = [
    'name', 'description', 'options', 'visibility',
    'resource_action', 'uri_attributes',
    'enablement_expression', 'visibility_expression',
    'disabled_text', 'applies_to_class',
  ].join(',');
  return API.get(`/api/custom_buttons/${recId}?attributes=${attrs}`).then((data) => {
    const values = { ...data };

    // Attribute/value pairs — convert flat uri_attributes object into [{key, value}] array
    const skipKeys = new Set(['request', 'object_name', 'service_template_name', 'hosts']);
    values.attribute_pairs = Object.entries(data.uri_attributes || {})
      .filter(([k]) => !skipKeys.has(k))
      .map(([k, v]) => ({ key: k, value: v }));

    // Ansible playbook inventory_type normalisation (same logic as CustomButtonForm)
    if (data.options?.button_type === 'ansible_playbook') {
      values.uri_attributes = { ...data.uri_attributes, request: 'create' };
      const hosts = data.uri_attributes?.hosts;
      if (hosts === 'localhost') {
        values.inventory_type = 'localhost';
      } else if (hosts === 'vmdb_object') {
        values.inventory_type = 'vmdb_object';
      } else {
        values.inventory_type = 'manual';
        values.hosts = hosts;
      }
    }

    // Role visibility normalisation — SELECT expects a string, not an array
    if (data.visibility?.roles) {
      if (data.visibility.roles[0] === '_ALL_') {
        values.visibility = { roles: '_ALL_' };
      } else {
        values.available_roles = data.visibility.roles;
        values.visibility = { roles: 'role' };
      }
    }

    // Expressions come back as { exp: {...} } objects from the API
    values.enablement_expression = data.enablement_expression?.exp ?? null;
    values.visibility_expression = data.visibility_expression?.exp ?? null;

    // dialog_id comes back as a string from the API — cast to int so the select matches
    if (values.resource_action?.dialog_id) {
      values.resource_action = {
        ...values.resource_action,
        dialog_id: parseInt(values.resource_action.dialog_id, 10),
      };
    }

    return values;
  });
};

const buildSubmitData = (values, recId, appliesToClass, appliesToId, initialValues, buttonIcon) => {
  const submit = { ...values };

  submit.applies_to_class = appliesToClass;
  submit.applies_to_id = recId ? initialValues.applies_to_id : appliesToId;

  if (submit.options) {
    submit.options = { ...submit.options, button_icon: buttonIcon };
  }

  // Role visibility — convert back from normalised form to API format
  if (values.visibility?.roles === 'role' && values.available_roles) {
    let roles = values.available_roles;
    if (recId && roles.length > 0 && roles[0].value === undefined) {
      roles = roles.map((r) => ({ label: r, value: r }));
    }
    submit.visibility = { roles: roles.map((r) => r.value) };
    delete submit.available_roles;
  } else {
    submit.visibility = { roles: ['_ALL_'] };
  }

  // Resource action
  submit.resource_action = {
    ...submit.resource_action,
    ae_class: 'PROCESS',
    ae_namespace: 'SYSTEM',
  };

  // Attribute/value pairs — re-pack [{key, value}] array back into uri_attributes
  if (values.options?.button_type !== 'ansible_playbook') {
    const packed = {};
    (values.attribute_pairs || []).forEach(({ key, value }) => {
      if (key && key.trim()) {
        packed[key.trim()] = (value || '').trim();
      }
    });
    submit.uri_attributes = { ...(submit.uri_attributes || {}), ...packed };
    delete submit.attribute_pairs;
  }

  // Ansible playbook hosts
  if (values.options?.button_type === 'ansible_playbook') {
    submit.uri_attributes = { ...values.uri_attributes, request: 'Order_Ansible_Playbook' };
    if (values.inventory_type === 'vmdb_object') {
      submit.uri_attributes.hosts = 'vmdb_object';
    } else if (values.inventory_type === 'manual') {
      submit.uri_attributes.hosts = values.hosts;
    } else {
      submit.uri_attributes.hosts = 'localhost';
    }
    delete submit.inventory_type;
    delete submit.hosts;
  }

  // Expressions — strip the sentinel value used when editor has errors
  const INVALID = '__expression_invalid__';
  submit.enablement_expression = (values.enablement_expression && values.enablement_expression !== INVALID)
    ? { exp: values.enablement_expression }
    : null;
  submit.visibility_expression = (values.visibility_expression && values.visibility_expression !== INVALID)
    ? { exp: values.visibility_expression }
    : null;

  // Clear expressions when not applicable
  if (values.options?.display_for !== 'single') {
    submit.enablement_expression = null;
    submit.visibility_expression = null;
  }

  return submit;
};

export {
  getButtonTypes, getButtonFormData,
  getRoles, getServiceDialogs, getInitialValues, buildSubmitData,
};
