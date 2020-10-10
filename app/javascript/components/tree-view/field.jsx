import React from 'react';
import PropTypes from 'prop-types';
import { Tree, ActionTypes } from 'react-wooden-tree';
import {
  ControlLabel, FieldLevelHelp, FormGroup, HelpBlock,
} from 'patternfly-react';
import { useFieldApi, useFormApi } from '@data-driven-forms/react-form-renderer';

import RequiredLabel from '../../forms/required-label';
import TreeViewBase from './base';

const TreeViewField = ({
  loadData, lazyLoadData, helperText, isRequired, label, identifier, ...props
}) => {
  const { input: { value = [], name }, meta } = useFieldApi(props);
  const formOptions = useFormApi();

  const actionMapper = {
    [ActionTypes.CHECKED_DIRECTLY]: (node, value) => {
      const { value: values = [] } = formOptions.getFieldState(name);
      formOptions.change(name, value ? [...values, identifier(node)] : values.filter(item => item !== identifier(node)));
      return Tree.nodeChecked(node, value);
    },
  };

  return (
    <FormGroup validationState={meta.error ? 'error' : null}>
      <ControlLabel>
        {isRequired ? <RequiredLabel label={label} /> : label }
        {helperText && <FieldLevelHelp content={helperText} />}
      </ControlLabel>
      <TreeViewBase
        loadData={loadData}
        lazyLoadData={lazyLoadData}
        actionMapper={actionMapper}
        check={node => value.includes(identifier(node))}
        isMulti
        {...props}
      />
      {meta.error && <HelpBlock>{ meta.error }</HelpBlock>}
    </FormGroup>
  );
};

TreeViewField.propTypes = {
  loadData: PropTypes.func.isRequired,
  lazyLoadData: PropTypes.func,
  helperText: PropTypes.string,
  isRequired: PropTypes.bool,
  label: PropTypes.string,
  identifier: PropTypes.func,
};

TreeViewField.defaultProps = {
  lazyLoadData: () => undefined,
  helperText: undefined,
  isRequired: false,
  label: undefined,
  identifier: node => node.attr.key,
};

export default TreeViewField;
