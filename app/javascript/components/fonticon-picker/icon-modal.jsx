/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Modal,
  ModalBody,
} from '@carbon/react';
import IconList from './icon-list';

const IconModal = ({
  hide, activeIcon, iconTypes, onModalApply, setState,
}) => (
  <Modal
    open
    modalHeading={__('Select an icon')}
    primaryButtonText={__('Apply')}
    secondaryButtonText={__('Cancel')}
    onRequestSubmit={onModalApply}
    onRequestClose={hide}
    className="font-icon-list-modal"
  >
    <ModalBody className="font-icon-list-modal-body">
      <div className="fonticon-picker-modal">
        <Tabs>
          <TabList aria-label="Icon type tabs">
            {Object.keys(iconTypes).map((type) => (
              <Tab key={type}>{iconTypes[type]}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {Object.keys(iconTypes).map((type) => (
              <TabPanel key={type}>
                <IconList
                  type={type}
                  activeIcon={activeIcon}
                  setState={setState}
                />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </ModalBody>
  </Modal>
);
IconModal.propTypes = {
  setState: PropTypes.func.isRequired,
};

export default IconModal;
