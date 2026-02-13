import React from 'react';
import PropTypes from 'prop-types';
import { useFormApi } from '@data-driven-forms/react-form-renderer';
import { Button, ButtonSet } from '@carbon/react';

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

      <ButtonSet>
        <Button kind="primary" disabled={submitValue || !valid} type="submit">{__('Save')}</Button>
        <Button kind="secondary" disabled={submitValue} onClick={onReset} type="button">{__('Reset')}</Button>
        <Button kind="secondary" type="button" onClick={onCancel}>{__('Cancel')}</Button>
      </ButtonSet>
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
