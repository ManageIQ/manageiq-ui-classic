import React from 'react';
import { componentMapper, components } from '@data-driven-forms/pf3-component-mapper';
import { componentTypes } from '@@ddf';

import AsyncCredentials from '../../components/async-credentials/async-credentials';
import DualGroup from '../../components/dual-group';
import DualListSelect from '../../components/dual-list-select';
import EditPasswordField from '../../components/async-credentials/edit-password-field';
import PasswordField from '../../components/async-credentials/password-field';
import { DataDrivenFormCodeEditor } from '../../components/code-editor';
import FieldArray from '../../components/field-array';

const mapper = {
  ...componentMapper,
  'code-editor': DataDrivenFormCodeEditor,
  'edit-password-field': EditPasswordField,
  'field-array': FieldArray,
  'dual-group': DualGroup,
  'dual-list-select': DualListSelect,
  hr: () => <hr />,
  note: props => <div className={props.className} role="alert">{props.label}</div>,
  'password-field': PasswordField,
  'validate-credentials': AsyncCredentials,
  [componentTypes.SELECT]: props => <components.Select placeholder={`<${__('Choose')}>`} {...props} />,
};

export default mapper;
