/* global miqFlashLater */
import React from 'react';
import { Field } from 'react-final-form';
import {
  FinalFormSelect,
  FinalFormTextArea,
  FinalFormField,
  FinalFormSwitch,
} from '@manageiq/react-ui-components/dist/forms';
import { required } from 'redux-form-validators';
import {
  DROPDOWN_OPTIONS,
  DEFAULT_PLACEHOLDER,
  PROVISIONING_FORM_FIELDS,
  FORM_DEFAULTS,
} from './constants';
import { API } from '../../http_api';

export const buildDropDown = (data = [], label, value) => data.map(item => (
  { label: item[label], value: item[value] }));

export const renderFormField = (field, formData) => {
  const id = (field.id ? field.id : field.name);
  let displayField = true;
  if (field.condition) {
    displayField = (field.condition.is
      ? (formData[field.condition.when] === field.condition.is)
      : (formData[field.condition.when] !== field.condition.not));
  }

  return displayField ? (
    <Field key={id} inputColumnSize={8} labelColumnSize={3} {...field} />
  ) : <span key={id} />;
};

export const getResourceOptions = (values) => {
  if (values.retirement_playbook_id) {
    return DROPDOWN_OPTIONS.PLAYBOOK;
  }

  return [
    { label: __('No'), value: 'no_without_playbook' },
    { label: __('Yes'), value: 'yes_without_playbook' },
  ];
};

export const getAnsiblePlaybookFields = (props, isProvisioning) => {
  const { prefix, data } = props;
  const dropdowns = data.dropdowns || {};
  const repoField = `${prefix}_repository_id`;

  return [
    {
      name: `${prefix}_playbook_id`,
      label: __('Playbook'),
      component: FinalFormSelect,
      options: dropdowns[`${prefix}_playbooks`] || [],
      placeholder: DEFAULT_PLACEHOLDER,
      validateOnMount: isProvisioning,
      condition: { when: repoField, not: '' },
      validate: isProvisioning ? required({ msg: __('Required') }) : undefined,
    },
    {
      name: `${prefix}_credential_id`,
      label: __('Machine Credential'),
      component: FinalFormSelect,
      options: dropdowns.machineCredentials || [],
      placeholder: DEFAULT_PLACEHOLDER,
      validateOnMount: isProvisioning,
      validate: isProvisioning ? required({ msg: __('Required') }) : undefined,
    },
    {
      name: `${prefix}_vault_credential_id`,
      label: __('Vault Credential'),
      component: FinalFormSelect,
      options: dropdowns.vaultCredentials || [],
      placeholder: DEFAULT_PLACEHOLDER,
    },
    {
      name: `${prefix}_hosts`,
      label: __('Hostnames'),
      component: FinalFormTextArea,
    },
    {
      name: `${prefix}_execution_ttl`,
      label: __('Max TTL (mins)'),
      component: FinalFormField,
    },
    {
      name: `${prefix}_log_output`,
      label: __('Logging Output'),
      component: FinalFormSelect,
      options: DROPDOWN_OPTIONS.LOGGING_OUTPUT,
      placeholder: DEFAULT_PLACEHOLDER,
    },
    {
      name: `${prefix}_become_enabled`,
      component: FinalFormSwitch,
      label: __('Escalate Privileges'),
      onText: __('Yes'),
      offText: __('No'),
    },
    {
      name: `${prefix}_verbosity`,
      label: __('Verbosity'),
      component: FinalFormSelect,
      options: DROPDOWN_OPTIONS.VERBOSITY,
      placeholder: DEFAULT_PLACEHOLDER,
    },
  ];
};

export const formatExtraVars = extraVars => Object.keys(extraVars).map(key => ({
  key,
  default: extraVars[key].default,
}));

export const buildExtraVarsObj = (vars) => {
  const extraVars = {};
  vars.forEach((extraVar) => {
    extraVars[extraVar.key] = { default: extraVar.default };
  });
  return extraVars;
};

export const getAnsibleCatalogItemFields = dropdowns => [
  {
    component: FinalFormField,
    name: 'name',
    label: __('Name'),
    validateOnMount: true,
    validate: required({ msg: __('Required') }),
  },
  {
    component: FinalFormField,
    name: 'description',
    id: 'description',
    label: __('Description'),
  },
  {
    name: 'display',
    component: FinalFormSwitch,
    label: __('Display in Catalog'),
    onText: __('Yes'),
    offText: __('No'),
  },
  {
    condition: { when: 'display', is: true },
    name: 'long_description',
    label: __('Long Description'),
    component: FinalFormTextArea,
  },
  {
    options: dropdowns.catalogs || [],
    label: __('Catalog'),
    component: FinalFormSelect,
    name: 'service_template_catalog_id',
    placeholder: DEFAULT_PLACEHOLDER,
    searchable: true,
  },
];

export const provisionDialogMessage = () => (
  <span>
    {__('Are you sure you want the retirement options to be copied from provisioning?')}
    <p>
      {__('Warning: You will lose all of your current retirement options if you continue with this action')}
    </p>
  </span>);

export const submitCatalogForm = (url, isNew, formData, catalogItemFormId) => {
  const msg = isNew ? 'added' : 'updated';
  API.post(url, formData).then(() => {
    miqFlashLater({ message: `Catalog item was ${msg} successfully.` });
    const redirectUrl = isNew ? '/catalog/explorer/?button=save' : `/catalog/explorer/${catalogItemFormId}?button=save`;
    window.location.assign(redirectUrl);
  }).catch((error) => {
    if (!error.data) {
      error.data = { // eslint-disable-line no-param-reassign
        error: { message: `Catalog item failed to be ${msg}. ${error.message || ''}` },
      };
    }
    window.add_flash(error.data.error.message, 'error');
  });
};

export const setFormDefaultValues = () => {
  const provisioningFormFields = PROVISIONING_FORM_FIELDS;
  const initial = FORM_DEFAULTS;
  Object.keys(provisioningFormFields).forEach((field) => {
    initial[`provision_${field}`] = provisioningFormFields[field];
    initial[`retirement_${field}`] = provisioningFormFields[field];
  });

  return initial;
};
