import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'carbon-components-react';

export const modalCallbackTypes = {
  CLOSE: 'close',
  OK: 'ok',
  CANCEL: 'cancel',
};

/** Component to render a confirmation-modal-box */
const MiqConfirmActionModal = ({ modalData }) => (
  <Modal
    open={modalData.open}
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
    open: PropTypes.bool.isRequired,
    callback: PropTypes.func.isRequired,
    label: PropTypes.string,
    confirm: PropTypes.string.isRequired,
  }).isRequired,
};
