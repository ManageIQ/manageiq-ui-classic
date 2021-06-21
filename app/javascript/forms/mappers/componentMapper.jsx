import React from 'react';
import { componentMapper } from '@data-driven-forms/carbon-component-mapper';
import { componentTypes } from '@@ddf';
import AsyncCredentials from '../../components/async-credentials/async-credentials';
import EditPasswordField from '../../components/async-credentials/edit-password-field';
import PasswordField from '../../components/async-credentials/password-field';
import Select from '../../components/select';
import CodeEditor from '../../components/code-editor';
import { TreeViewField, TreeViewSelector } from '../../components/tree-view';
import MultiSelectWithSelectAll from '../../components/multiselect-with-selectall';

const mapper = {
  ...componentMapper,
  'code-editor': CodeEditor,
  'edit-password-field': EditPasswordField,
  'password-field': PasswordField,
  'validate-credentials': AsyncCredentials,
  'tree-view': TreeViewField,
  'tree-selector': TreeViewSelector,
  [componentTypes.SELECT]: Select,
  'multi-select': MultiSelectWithSelectAll,
};

export default mapper;
