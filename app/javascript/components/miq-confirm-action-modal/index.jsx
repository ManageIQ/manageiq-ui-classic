import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@carbon/react';

export const modalCallbackTypes = {
  CLOSE: 'close',
  OK: 'ok',
  CANCEL: 'cancel',
};

/** Component to render a confirmation-modal-box */
const MiqConfirmActionModal = ({ modalData }) => (
  <Modal
    open
    modalHeading={modalData.label || __('Confirm')}
    primaryButtonText={__('Ok')}
    secondaryButtonText={__('Cancel')}
    onRequestClose={() => modalData.callback(modalCallbackTypes.CLOSE)}
    onRequestSubmit={() => modalData.callback(modalCallbackTypes.OK)}
    onSecondarySubmit={() => modalData.callback(modalCallbackTypes.CANCEL)}
  >
    <div>{modalData.confirm}</div>
  </Modal>
);

export default MiqConfirmActionModal;

MiqConfirmActionModal.propTypes = {
  modalData: PropTypes.shape({
    callback: PropTypes.func.isRequired,
    label: PropTypes.string,
    confirm: PropTypes.string.isRequired,
  }).isRequired,
};
