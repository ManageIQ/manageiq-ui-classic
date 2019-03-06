import React from 'react';
import { formFieldsMapper } from '@data-driven-forms/pf3-component-mapper';
import DualListSelect from '../../components/dual-list-select';
import AsyncCredentials from '../../components/async-credentials/async-credentials';
import EditSecretField from '../../components/async-credentials/edit-secret-field';
import SecretSwitchField from '../../components/async-credentials/secret-switch-field';

const fieldsMapper = {
  ...formFieldsMapper,
  'dual-list-select': DualListSelect,
  hr: () => <hr />,
  'validate-credentials': AsyncCredentials,
  'credentials-password-edit': EditSecretField,
  'secret-switch-field': SecretSwitchField,
};

export default fieldsMapper;
