import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import {
  Tabs,
  Tab,
  Modal, ModalBody,
} from 'carbon-components-react';
import { dynamicComponents } from '../data';
import { createSchema } from './edit-field-modal.schema';

const EditFieldModal = ({
  componentId, fieldConfiguration, showModal, onModalHide, onModalApply,
}) => {
  const [data, setData] = useState({
    initialValues: {},
  });

  const component = dynamicComponents.find((item) => item.id === componentId);
  const onSubmit = () => console.log('on Submit');
  const onCancel = () => console.log('on Cancel');
  return (
    <Modal
      open={showModal}
      modalHeading={__(`Edit this ${component.title}`)}
      primaryButtonText={__('Save')}
      secondaryButtonText={__('Cancel')}
      onRequestSubmit={onModalApply}
      onRequestClose={onModalHide}
      className="edit-field-modal"
    >
      <ModalBody className="edit-field-modal-body">
        <MiqFormRenderer
          schema={createSchema(fieldConfiguration)}
          initialValues={data.initialValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </ModalBody>
    </Modal>
  );
};

EditFieldModal.propTypes = {
  componentId: PropTypes.number.isRequired,
  fieldConfiguration: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.any),
  })).isRequired,
  showModal: PropTypes.bool.isRequired,
  onModalHide: PropTypes.func.isRequired,
  onModalApply: PropTypes.func.isRequired,
};

export default EditFieldModal;
