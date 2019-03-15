import React from 'react';
import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { formFieldsMapper } from '@data-driven-forms/pf3-component-mapper';
import DualListSelect from '../../components/dual-list-select';
import AsyncCredentials from '../../components/async-credentials/async-credentials';
import EditSecretField from '../../components/async-credentials/edit-secret-field';
import SecretSwitchField from '../../components/async-credentials/secret-switch-field';
import MiqWizard, { InitialWizardStep } from '../../components/miq-wizard';

const summary = ({ formOptions }) => (
  <div>
    <h1>Summary</h1>
    <pre>
      {JSON.stringify(formOptions.getState().values, null, 2)}
    </pre>
  </div>
);


const fieldsMapper = {
  ...formFieldsMapper,
  'dual-list-select': DualListSelect,
  hr: () => <hr />,
  'validate-credentials': AsyncCredentials,
  'credentials-password-edit': EditSecretField,
  'secret-switch-field': SecretSwitchField,
  wizard: MiqWizard,
  'provider-initial-step': InitialWizardStep,
  summary,
};

export default fieldsMapper;
