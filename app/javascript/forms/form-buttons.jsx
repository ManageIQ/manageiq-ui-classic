import React from 'react';
import PropTypes from 'prop-types';

import MiqButton from './miq-button';

function FormButtons(props) {
  let primaryTitle = props.customLabel || (props.newRecord ? __('Add') : __('Save'));
  let primaryHandler = (props.newRecord ? props.addClicked : props.saveClicked) || props.addClicked || props.saveClicked;

  let resetTitle = __("Reset");
  let cancelTitle = __("Cancel");

  return (
    <React.Fragment>
      <div className="clearfix"></div>
      <div className="pull-right button-group edit_buttons">
        <MiqButton name={primaryTitle} title={primaryTitle} enabled={props.saveable} onClick={primaryHandler} primary={true} />
        {props.newRecord || <MiqButton name={resetTitle} title={resetTitle} enabled={! props.pristine} onClick={props.resetClicked} />}
        <MiqButton name={cancelTitle} title={cancelTitle} enabled={true} onClick={props.cancelClicked} />

      </div>
    </React.Fragment>
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

FormButtons.defaultProps =  {
  newRecord: false,
  customLabel: '',
  saveable: false,
  pristine: true,
  addClicked: noop,
  saveClicked: noop,
  resetClicked: noop,
  cancelClicked: noop,
}

export default FormButtons;
