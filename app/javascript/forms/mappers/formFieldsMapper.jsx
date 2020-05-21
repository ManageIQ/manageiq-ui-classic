import React from 'react';
import { formFieldsMapper } from '@data-driven-forms/pf3-component-mapper';

import AsyncCredentials from '../../components/async-credentials/async-credentials';
import AsyncProviderCredentials from '../../components/async-credentials/async-provider-credentials';
import DualGroup from '../../components/dual-group';
import DualListSelect from '../../components/dual-list-select';
import EditPasswordField from '../../components/async-credentials/edit-password-field';
import InputWithDynamicPrefix from '../input-with-dynamic-prefix';
import PasswordField from '../../components/async-credentials/password-field';
import { DataDrivenFormCodeEditor } from '../../components/code-editor';
import FieldArray from '../../components/field-array';

const fieldsMapper = {
  ...formFieldsMapper,
  'code-editor': DataDrivenFormCodeEditor,
  'edit-password-field': EditPasswordField,
  'dual-group': DualGroup,
  'dual-list-select': DualListSelect,
  'input-with-dynamic-prefix': InputWithDynamicPrefix,
  hr: () => <hr />,
  'password-field': PasswordField,
  'validate-credentials': AsyncCredentials,
  'validate-provider-credentials': AsyncProviderCredentials,
  'field-array': FieldArray,
};

export default fieldsMapper;
