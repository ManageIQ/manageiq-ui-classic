import React from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Modal } from 'carbon-components-react';
import { createSchema } from './tab.schema';

const EditTabModal = ({
  tabInfo, usedTabNames, showModal, onSave, onModalHide,
}) => {
  const onCancel = () => onModalHide();

  const handleSubmit = (formValues, e) => {
    onSave(e, formValues);
  };

  return (
    <Modal
      open={showModal}
      modalHeading={__(`Edit this ${tabInfo.name || ''}`)}
      onRequestClose={onModalHide}
      passiveModal // Required to hide the save and cancel buttons on the Modal
      className="edit-tab-modal"
    >
      <MiqFormRenderer
        schema={createSchema(usedTabNames, tabInfo.name)}
        initialValues={{
          tab_name: tabInfo.name,
          tab_description: tabInfo.description,
        }}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </Modal>
  );
};

EditTabModal.propTypes = {
  tabInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  usedTabNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  showModal: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onModalHide: PropTypes.func.isRequired,
};

export default EditTabModal;
