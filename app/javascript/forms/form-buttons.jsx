import React from 'react';
import PropTypes from 'prop-types';

import MiqButton from './miq-button';

function FormButtons(props) {
  const primaryTitle = props.customLabel || (props.newRecord ? __('Add') : __('Save'));
  const primaryHandler = (props.newRecord ? props.addClicked : props.saveClicked) || props.addClicked || props.saveClicked;

  // NOTE: These strings will be translated by <MiqButton />
  const resetTitle = 'Reset';
  const cancelTitle = 'Cancel';

  const { btnType } = props;
  if (btnType === 'deleteModal') {
    return (
      <>
        <div className="clearfix" />
        <div className="modal-pull-right button-group edit_buttons">
          <MiqButton name={cancelTitle} btnType={btnType} title={cancelTitle} enabled onClick={props.cancelClicked} />
          <MiqButton name={primaryTitle} btnType={btnType} title={primaryTitle} enabled={props.saveable} onClick={primaryHandler} primary />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="clearfix" />
      <div className="pull-right button-group edit_buttons">
        <MiqButton name={primaryTitle} title={primaryTitle} enabled={props.saveable} onClick={primaryHandler} primary />
        {props.newRecord || <MiqButton name={resetTitle} title={resetTitle} enabled={!props.pristine} onClick={props.resetClicked} />}
        <MiqButton name={cancelTitle} title={cancelTitle} enabled onClick={props.cancelClicked} />
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

const noop = () => null;

FormButtons.defaultProps = {
  newRecord: false,
  customLabel: '',
  saveable: false,
  pristine: true,
  addClicked: noop,
  saveClicked: noop,
  resetClicked: noop,
  cancelClicked: noop,
};

export default FormButtons;
