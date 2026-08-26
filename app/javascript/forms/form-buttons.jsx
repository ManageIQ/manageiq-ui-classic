import PropTypes from 'prop-types';

import MiqButton from './miq-button';

export const formButtonsDefaultProps = {
  newRecord: false,
  customLabel: '',
  saveable: false,
  pristine: true,
  addClicked: () => null,
  saveClicked: () => null,
  resetClicked: () => null,
  cancelClicked: () => null,
};

function FormButtons({
  newRecord = formButtonsDefaultProps.newRecord,
  customLabel = formButtonsDefaultProps.customLabel,
  saveable = formButtonsDefaultProps.saveable,
  pristine = formButtonsDefaultProps.pristine,
  addClicked = formButtonsDefaultProps.addClicked,
  saveClicked = formButtonsDefaultProps.saveClicked,
  resetClicked = formButtonsDefaultProps.resetClicked,
  cancelClicked = formButtonsDefaultProps.cancelClicked,
  btnType,
}) {
  const primaryTitle = customLabel || (newRecord ? __('Add') : __('Save'));
  const primaryHandler = (newRecord ? addClicked : saveClicked) || addClicked || saveClicked;

  // NOTE: These strings will be translated by <MiqButton />
  const resetTitle = 'Reset';
  const cancelTitle = 'Cancel';

  if (btnType === 'deleteModal') {
    return (
      <>
        <div className="clearfix" />
        <div className="modal-pull-right button-group edit_buttons">
          <MiqButton name={cancelTitle} btnType={btnType} title={cancelTitle} enabled onClick={cancelClicked} />
          <MiqButton name={primaryTitle} btnType={btnType} title={primaryTitle} enabled={saveable} onClick={primaryHandler} primary />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="clearfix" />
      <div className="pull-right button-group edit_buttons">
        <MiqButton name={primaryTitle} title={primaryTitle} enabled={saveable} onClick={primaryHandler} primary />
        {newRecord || <MiqButton name={resetTitle} title={resetTitle} enabled={!pristine} onClick={resetClicked} />}
        <MiqButton name={cancelTitle} title={cancelTitle} enabled onClick={cancelClicked} />
      </div>
    </>
  );
}

FormButtons.propTypes = {
  newRecord: PropTypes.bool,
  customLabel: PropTypes.string,
  saveable: PropTypes.bool,
  pristine: PropTypes.bool,
  addClicked: PropTypes.func,
  saveClicked: PropTypes.func,
  resetClicked: PropTypes.func,
  cancelClicked: PropTypes.func,
};

export default FormButtons;
