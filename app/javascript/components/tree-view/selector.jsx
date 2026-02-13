import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tree, ActionTypes } from 'react-wooden-tree';
import {
  Modal, FormGroup, TextInput, Button, Grid, Column,
} from '@carbon/react';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { useFieldApi, useFormApi } from '@data-driven-forms/react-form-renderer';
import { TreeViewAlt, Close } from '@carbon/react/icons';

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
    <FormGroup legendText={labelText} className="miq-common-tree-view-selector">
      <Grid condensed className="miq-tree-view-selector-grid">
        <Column sm={3} md={6} lg={14} className="miq-tree-view-selector-input-grid-column">
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
        </Column>
        <Column sm={1} md={1} lg={1}>
          <Button
            className="tree-selector-toggle"
            hasIconOnly
            kind="primary"
            size="md"
            onClick={() => setState((state) => ({ ...state, show: true }))}
            iconDescription={modalLabel}
            renderIcon={(props) => <TreeViewAlt size={16} {...props} />}
          />
        </Column>
        {isClearable && (
          <Column sm={1} md={1} lg={1}>
            <Button
              className="tree-selector-clear"
              hasIconOnly
              size="md"
              onClick={() => formOptions.change(input.name, undefined)}
              iconDescription={clearLabel}
              renderIcon={(props) => <Close size={16} {...props} />}
            />
          </Column>
        )}
      </Grid>
      {show && (
        <Modal
          open
          onRequestClose={closeModal}
          modalHeading={label}
          primaryButtonText={selectLabel}
          secondaryButtonText={closeLabel}
          primaryButtonDisabled={!active}
          onRequestSubmit={changeValue}
        >
          <TreeViewBase
            loadData={loadData}
            lazyLoadData={lazyLoadData}
            actionMapper={actionMapper}
            select={(node) => identifier(node) === input.value}
            {...props}
          />
        </Modal>
      )}
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
