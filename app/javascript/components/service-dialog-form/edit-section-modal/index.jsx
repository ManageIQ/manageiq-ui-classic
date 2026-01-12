import React from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Modal } from 'carbon-components-react';
import { createSchema } from './section.schema';

const EditSectionModal = ({
  sectionInfo, usedSectionNames, showModal, onSave, onModalHide,
}) => {
  const handleSubmit = (formValues, e) => {
    onSave(e, formValues);
  };

  return (
    <Modal
      open={showModal}
      modalHeading={__(`Edit this ${sectionInfo.name || ''}`)}
      onRequestClose={onModalHide}
      passiveModal // Required to hide the save and cancel buttons on the Modal
      className="edit-section-modal"
    >
      <MiqFormRenderer
        schema={createSchema(usedSectionNames, sectionInfo.name)}
        initialValues={{
          section_name: sectionInfo.name,
          section_description: sectionInfo.description,
        }}
        onSubmit={handleSubmit}
        onCancel={onModalHide}
      />
    </Modal>
  );
};

EditSectionModal.propTypes = {
  sectionInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  usedSectionNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  showModal: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onModalHide: PropTypes.func.isRequired,
};

export default EditSectionModal;
