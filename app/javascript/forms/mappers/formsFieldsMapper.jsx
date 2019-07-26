import React from 'react';
import { formFieldsMapper } from '@data-driven-forms/pf3-component-mapper';

import AsyncCredentials from '../../components/async-credentials/async-credentials';
import DualGroup from '../../components/dual-group';
import DualListSelect from '../../components/dual-list-select';
import EditSecretField from '../../components/async-credentials/edit-secret-field';
import InputWithDynamicPrefix from '../input-with-dynamic-prefix';
import SecretSwitchField from '../../components/async-credentials/secret-switch-field';
import { DataDrivenFormCodeEditor } from '../../components/code-editor';

const fieldsMapper = {
  ...formFieldsMapper,
  'code-editor': DataDrivenFormCodeEditor,
  'credentials-password-edit': EditSecretField,
  'dual-group': DualGroup,
  'dual-list-select': DualListSelect,
  'input-with-dynamic-prefix': InputWithDynamicPrefix,
  hr: () => <hr />,
  'secret-switch-field': SecretSwitchField,
  'validate-credentials': AsyncCredentials,
};

export default fieldsMapper;
