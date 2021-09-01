import React, { useMemo } from 'react';
import {
  Grid, Row, Col,
  Button,
  Modal,
  ButtonGroup,
  Icon,
  Tabs,
  Tab,
} from 'patternfly-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import IconList from './icon-list';

const IconModal = ({
  showModal, hide, activeTab, selectedIcon, activeIcon, iconTypes, onModalApply, setState,
}) =>


  (
    <Modal show={showModal} onHide={hide} bsSize="large">
      <Modal.Header>
        <button
          id="close-icon-picker-modal"
          type="button"
          className="close"
          onClick={hide}
          aria-label={__('Close')}
        >
          <Icon type="pf" name="close" />
        </button>
        <Modal.Title>{ __('Select an icon') }</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="fonticon-picker-modal">
          <Tabs
            id="font-icon-tabs"
            activeKey={activeTab}
            animation={false}
            onSelect={(activeTab) => setState((state) => ({ ...state, activeTab }))}
          >
            { Object.keys(iconTypes).map((type) => (
              <Tab eventKey={type} key={type} title={iconTypes[type]}>
                <IconList
                  {...{
                    type,
                    activeIcon,
                    activeTab,
                    setState,
                  }}
                />
              </Tab>
            )) }
          </Tabs>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          id="apply-icon-picker-icon"
          bsStyle="primary"
          onClick={onModalApply}
          disabled={selectedIcon === activeIcon || activeIcon === undefined}
        >
          { __('Apply') }
        </Button>
        <Button id="cancel-icon-picker-modal" bsStyle="default" className="btn-cancel" onClick={hide}>
          { __('Cancel') }
        </Button>
      </Modal.Footer>
    </Modal>
  );
IconModal.propTypes = {
  setState: PropTypes.func.isRequired,
};

export default IconModal;
