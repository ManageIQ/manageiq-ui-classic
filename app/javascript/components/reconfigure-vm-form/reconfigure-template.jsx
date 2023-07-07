import React from 'react';
import PropTypes from 'prop-types';
import { useFormApi } from '@data-driven-forms/react-form-renderer';

const ReconfigureTemplate = ({
  formFields, canSubmit,
}) => {
  const {
    handleSubmit, onReset, onCancel, getState,
  } = useFormApi();
  const { submitting, valid, pristine } = getState();
  let formContent = '';
  if (formFields) {
    formContent = formFields;
  }
  const submitValue = canSubmit ? false : (submitting || pristine);

  return (
    <form onSubmit={handleSubmit} className="form-react reconfigure-form">
      {formContent}

      <div className="bx--btn-set">
        <button alt="Save" className="bx--btn bx--btn--primary" disabled={submitValue || !valid} type="submit">{__('Save')}</button>
        <button alt="Reset" className="bx--btn bx--btn--secondary" disabled={submitValue} onClick={onReset} type="button">{__('Reset')}</button>
        <button alt="Cancel" className="bx--btn bx--btn--secondary" type="button" onClick={onCancel}>{__('Cancel')}</button>
      </div>
    </form>
  );
};

ReconfigureTemplate.propTypes = {
  // eslint-disable-next-line react/require-default-props
  formFields: PropTypes.node,
  canSubmit: PropTypes.bool,
  hideButtons: PropTypes.bool,
};

ReconfigureTemplate.defaultProps = {
  canSubmit: false,
  hideButtons: false,
};

export default ReconfigureTemplate;
