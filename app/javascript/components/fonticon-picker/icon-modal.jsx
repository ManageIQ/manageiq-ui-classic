/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Tabs,
  Tab,
  Modal, ModalBody,
} from 'carbon-components-react';
import IconList from './icon-list';

const IconModal = ({
  showModal, hide, activeTab, activeIcon, iconTypes, onModalApply, setState,
}) =>

  (
    <Modal
      open={showModal}
      modalHeading={__('Select an icon')}
      primaryButtonText={__('Apply')}
      secondaryButtonText={__('Cancel')}
      onRequestSubmit={onModalApply}
      onRequestClose={hide}
      className="font-icon-list-modal"
    >
      <ModalBody className="font-icon-list-modal-body">
        <div className="fonticon-picker-modal">
          <Tabs
            id="font-icon-tabs"
            onClick={(activeTab) => setState((state) => ({ ...state, activeTab }))}
          >
            { Object.keys(iconTypes).map((type) => (
              <Tab key={type} label={iconTypes[type]}>
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
      </ModalBody>
    </Modal>
  );
IconModal.propTypes = {
  setState: PropTypes.func.isRequired,
};

export default IconModal;
