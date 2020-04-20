import React, { useState } from 'react';
import {
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

const FontIconPicker = ({ iconTypes, selected, onChangeURL }) => {
  const [{
    showModal,
    selectedIcon,
    activeTab,
    activeIcon,
  }, setState] = useState({
    showModal: false,
    selectedIcon: selected,
    activeIcon: selected,
    activeTab: selected ? selected.split(' ')[0] : Object.keys(iconTypes)[0],
  });

  const onModalApply = () => {
    // This is required to connect the old session-backed form with the component
    window.miqObserveRequest(onChangeURL, { data: { button_icon: activeIcon } });
    setState(state => ({ ...state, showModal: false, selectedIcon: activeIcon }));
  };

  const hideModal = () => setState(state => ({ ...state, showModal: false }));

  return (
    <div className="fonticon-picker">
      <ButtonGroup>
        <Button className="icon-picker-btn">
          { selectedIcon ? (<i id="selected-icon" className={classNames('fa-lg', selectedIcon)} />) : __('No icon') }
        </Button>
        <Button onClick={() => setState(state => ({ ...state, showModal: true }))}><Icon type="fa" name="angle-down" /></Button>
      </ButtonGroup>
      <Modal show={showModal} onHide={hideModal} bsSize="large">
        <Modal.Header>
          <button
            id="close-icon-picker-modal"
            type="button"
            className="close"
            onClick={hideModal}
            aria-label={__('Close')}
          >
            <Icon type="pf" name="close" />
          </button>
          <Modal.Title>{ __('Select an icon') }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="fonticon-picker-modal">
            <Tabs id="font-icon-tabs" activeKey={activeTab} animation={false} onSelect={activeTab => setState(state => ({ ...state, activeTab }))}>
              { Object.keys(iconTypes).map(type => (
                <Tab eventKey={type} key={type} title={iconTypes[type]}>
                  <IconList {...{
                    type,
                    activeIcon,
                    activeTab,
                    setState,
                  }} />
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
            Apply
          </Button>
          <Button id="cancel-icon-picker-modal" bsStyle="default" className="btn-cancel" onClick={hideModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

FontIconPicker.propTypes = {
  iconTypes: PropTypes.any,
  selected: PropTypes.string,
  onChangeURL: PropTypes.string.isRequired,
};

FontIconPicker.defaultProps = {
  selected: undefined,
  iconTypes: {
    ff: 'Font Fabulous',
    pficon: 'PatternFly',
    fa: 'Font Awesome',
  },
};

export default FontIconPicker;
