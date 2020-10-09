import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tree, ActionTypes } from 'react-wooden-tree';
import { Modal, Button } from 'patternfly-react';
import { useFieldApi, useFormApi, componentTypes } from '@data-driven-forms/react-form-renderer';

import TreeViewBase from './base';

const TreeViewSelector = ({
  loadData,
  lazyLoadData,
  isClearable,
  modalLabel,
  modalIcon,
  clearLabel,
  clearIcon,
  closeLabel,
  selectLabel,
  ...props
}) => {
  const [{ show, active }, setState] = useState({});

  const { input: { value, name } } = useFieldApi(props);
  const formOptions = useFormApi();

  const closeModal = () => setState(state => ({ ...state, show: false, active: undefined }));

  const changeValue = () => {
    formOptions.change(name, active);
    closeModal();
  };

  const actionMapper = {
    [ActionTypes.SELECTED]: (node, values) => {
      if (values) {
        setState(state => ({ ...state, active: node.attr.key }));
      }
      return Tree.nodeSelected(node, values);
    },
  };

  const component = {
    ...props,
    component: componentTypes.TEXT_FIELD,
    inputAddon: {
      after: {
        fields: [
          {
            component: componentTypes.INPUT_ADDON_BUTTON_GROUP,
            name: `${name}-toggle-container`,
            fields: [
              {
                component: componentTypes.BUTTON,
                label: <i className={modalIcon} />,
                title: modalLabel,
                name: `${name}-toggle`,
                onClick: () => setState(state => ({ ...state, show: true })),
              },
              ...(isClearable ? [{
                component: componentTypes.BUTTON,
                label: <i className={clearIcon} />,
                title: clearLabel,
                name: `${name}-clear`,
                onClick: () => formOptions.change(name, undefined),
              }] : []),
            ],
          },
        ],
      },
    },
  };

  return (
    <>
      { formOptions.renderForm([component]) }
      <Modal show={show} onHide={closeModal}>
        <Modal.Header>
          { props.label }
        </Modal.Header>
        <Modal.Body>
          <TreeViewBase
            loadData={loadData}
            lazyLoadData={lazyLoadData}
            actionMapper={actionMapper}
            selected={value}
            {...props}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={changeValue} disabled={!active}>
            {selectLabel}
          </Button>
          <Button bsStyle="default" className="btn-cancel" onClick={closeModal}>
            {closeLabel}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

TreeViewSelector.propTypes = {
  loadData: PropTypes.func.isRequired,
  lazyLoadData: PropTypes.func,
  isClearable: PropTypes.bool,
  label: PropTypes.string,
  modalIcon: PropTypes.string,
  modalLabel: PropTypes.string,
  clearIcon: PropTypes.string,
  clearLabel: PropTypes.string,
  selectLabel: PropTypes.string,
  closeLabel: PropTypes.string,
};

TreeViewSelector.defaultProps = {
  lazyLoadData: () => undefined,
  isClearable: false,
  label: undefined,
  modalIcon: 'ff ff-load-balancer',
  modalLabel: __('Toggle'),
  clearIcon: 'fa fa-times',
  clearLabel: __('Clear'),
  selectLabel: __('Select'),
  closeLabel: __('Close'),
};

export default TreeViewSelector;
