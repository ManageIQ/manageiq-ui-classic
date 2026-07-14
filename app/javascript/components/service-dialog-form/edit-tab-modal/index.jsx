import PropTypes from 'prop-types';
import { Modal } from '@carbon/react';
import MiqFormRenderer from '../../../forms/data-driven-form';
import tabSchema from './tab.schema';

const EditTabModal = ({
  tab,
  isOpen,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      modalHeading={tab && tab.label ? sprintf(__('Edit Tab "%s"'), tab.label) : __('Add Tab')}
      passiveModal
      onRequestClose={onClose}
      size="sm"
    >
      <MiqFormRenderer
        schema={tabSchema(tab || {})}
        initialValues={tab || {}}
        onSubmit={onSave}
        onCancel={onClose}
        buttonsLabels={{ submitLabel: __('Save') }}
        canReset={false}
      />
    </Modal>
  );
};

EditTabModal.propTypes = {
  tab: PropTypes.shape({
    label: PropTypes.string,
    description: PropTypes.string,
  }),
  isOpen: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

EditTabModal.defaultProps = {
  tab: undefined,
  isOpen: false,
};

export default EditTabModal;
