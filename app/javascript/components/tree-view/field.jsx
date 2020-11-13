import React from 'react';
import PropTypes from 'prop-types';
import { Tree, ActionTypes } from 'react-wooden-tree';
import { FormGroup } from 'carbon-components-react';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { useFieldApi, useFormApi } from '@data-driven-forms/react-form-renderer';

import HelperTextBlock from '../../forms/helper-text-block';
import TreeViewBase from './base';

const TreeViewField = ({
  loadData, lazyLoadData, validateOnMount, helperText, identifier, ...props
}) => {
  const {
    labelText,
    FormGroupProps,
    input: { value = [], name },
    meta: { error, warning, touched },
  } = useFieldApi(prepareProps(props));

  const formOptions = useFormApi();

  const invalid = (touched || validateOnMount) && error;
  const warnText = (touched || validateOnMount) && warning;

  const actionMapper = {
    [ActionTypes.CHECKED_DIRECTLY]: (node, value) => {
      const { value: values = [] } = formOptions.getFieldState(name);
      formOptions.change(name, value ? [...values, identifier(node)] : values.filter((item) => item !== identifier(node)));
      return Tree.nodeChecked(node, value);
    },
  };

  return (
    <FormGroup legendText={labelText} {...FormGroupProps}>
      <TreeViewBase
        loadData={loadData}
        lazyLoadData={lazyLoadData}
        actionMapper={actionMapper}
        check={(node) => value.includes(identifier(node))}
        isMulti
        {...props}
      />
      <HelperTextBlock helperText={helperText} errorText={invalid} warnText={warnText} />
    </FormGroup>
  );
};

TreeViewField.propTypes = {
  loadData: PropTypes.func.isRequired,
  lazyLoadData: PropTypes.func,
  helperText: PropTypes.string,
  isRequired: PropTypes.bool,
  label: PropTypes.string.isRequired,
  identifier: PropTypes.func,
  validateOnMount: PropTypes.bool,
};

TreeViewField.defaultProps = {
  lazyLoadData: () => undefined,
  helperText: undefined,
  isRequired: false,
  validateOnMount: undefined,
  identifier: (node) => node.attr.key,
};

export default TreeViewField;
