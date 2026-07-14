import PropTypes from 'prop-types';
import { Modal } from '@carbon/react';
import MiqFormRenderer from '../../../forms/data-driven-form';
import sectionSchema from './section.schema';

const EditSectionModal = ({
  section,
  isOpen,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      modalHeading={section && section.label ? sprintf(__('Edit Section "%s"'), section.label) : __('Add Section')}
      passiveModal
      onRequestClose={onClose}
      size="sm"
    >
      <MiqFormRenderer
        schema={sectionSchema(section || {})}
        initialValues={section || {}}
        onSubmit={onSave}
        onCancel={onClose}
        buttonsLabels={{ submitLabel: __('Save') }}
        canReset={false}
      />
    </Modal>
  );
};

EditSectionModal.propTypes = {
  section: PropTypes.shape({
    label: PropTypes.string,
    description: PropTypes.string,
  }),
  isOpen: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

EditSectionModal.defaultProps = {
  section: undefined,
  isOpen: false,
};

export default EditSectionModal;
