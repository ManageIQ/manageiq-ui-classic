import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tree, ActionTypes } from 'react-wooden-tree';
import {
  Modal, FormGroup, TextInput, Button,
} from 'carbon-components-react';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { useFieldApi, useFormApi } from '@data-driven-forms/react-form-renderer';
import { TreeViewAlt16, Close16 } from '@carbon/icons-react';

import TreeViewBase from './base';

const TreeViewSelector = ({
  loadData,
  lazyLoadData,
  identifier,
  isClearable,
  modalLabel,
  clearLabel,
  closeLabel,
  selectLabel,
  ...props
}) => {
  const [{ show, active }, setState] = useState({});

  // const { input: { value, name } } = useFieldApi(props);

  const {
    labelText, validateOnMount, input, meta, ...rest
  } = useFieldApi(prepareProps(props));

  // const { labelText, input, meta, validateOnMount, ...rest } = useFieldApi(prepareProps(props));
  const invalid = (meta.touched || validateOnMount) && (meta.error || meta.submitError);
  const warn = (meta.touched || validateOnMount) && meta.warning;

  const formOptions = useFormApi();

  const closeModal = () => setState((state) => ({ ...state, show: false, active: undefined }));

  const changeValue = () => {
    formOptions.change(input.name, active);
    closeModal();
  };

  const actionMapper = {
    [ActionTypes.SELECTED]: (node, values) => {
      if (values) {
        setState((state) => ({ ...state, active: identifier(node) }));
      }
      return Tree.nodeSelected(node, values);
    },
  };
  const { label } = props;
  return (
    <FormGroup legendText={labelText}>
      <div className="bx--grid" style={{ paddingLeft: 0, marginLeft: 0 }}>
        <div className="bx--row">
          <div className="bx--col-lg-15 bx--col-md-7 bx--col-sm-3">
            <TextInput
              {...input}
              labelText=""
              key={input.name}
              id={input.name}
              invalid={Boolean(invalid)}
              invalidText={invalid || ''}
              warn={Boolean(warn)}
              warnText={warn || ''}
              {...rest}
            />
          </div>
          <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1">
            <Button
              className="tree-selector-toggle"
              hasIconOnly
              kind="primary"
              size="field"
              onClick={() => setState((state) => ({ ...state, show: true }))}
              iconDescription={modalLabel}
              renderIcon={TreeViewAlt16}
            />
            { isClearable && (
              <Button
                className="tree-selector-clear"
                hasIconOnly
                kind="danger"
                size="field"
                onClick={() => formOptions.change(input.name, undefined)}
                iconDescription={clearLabel}
                renderIcon={Close16}
              />
            )}
          </div>
        </div>
      </div>
      <Modal
        open={show}
        onRequestClose={closeModal}
        modalHeading={label}
        primaryButtonText={selectLabel}
        secondaryButtonText={closeLabel}
        primaryButtonDisabled={!active}
        onRequestSubmit={changeValue}
        onSecondarySubmit={closeModal}
      >
        <TreeViewBase
          loadData={loadData}
          lazyLoadData={lazyLoadData}
          actionMapper={actionMapper}
          select={(node) => identifier(node) === input.value}
          {...props}
        />
      </Modal>
    </FormGroup>
  );
};

TreeViewSelector.propTypes = {
  loadData: PropTypes.func.isRequired,
  lazyLoadData: PropTypes.func,
  identifier: PropTypes.func,
  isClearable: PropTypes.bool,
  label: PropTypes.string,
  modalLabel: PropTypes.string,
  clearLabel: PropTypes.string,
  selectLabel: PropTypes.string,
  closeLabel: PropTypes.string,
};

TreeViewSelector.defaultProps = {
  lazyLoadData: () => undefined,
  isClearable: false,
  identifier: (node) => node.attr.key,
  label: undefined,
  modalLabel: __('Toggle'),
  clearLabel: __('Clear'),
  selectLabel: __('Select'),
  closeLabel: __('Close'),
};

export default TreeViewSelector;
