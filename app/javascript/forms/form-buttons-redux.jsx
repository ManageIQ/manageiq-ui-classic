import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FormButtons from './form-buttons';

function FormButtonsRedux(props) {
  return <FormButtons {...props} />;
}

FormButtonsRedux.propTypes = {
  callbackOverrides: PropTypes.shape({
    addClicked: PropTypes.func,
    saveClicked: PropTypes.func,
    resetClicked: PropTypes.func,
    cancelClicked: PropTypes.func,
  }),
};

FormButtonsRedux.defaultProps = {
  callbackOverrides: {},
};


function mapStateToProps(state, ownProps) {
  const props = { ...state.FormButtons };

  if (state.FormButtons && ownProps.callbackOverrides) {
    // allow overriding click handlers
    // the original handler is passed as the only argument to the new one
    Object.keys(ownProps.callbackOverrides).forEach((name) => {
      props[name] = () => {
        const origHandler = state.FormButtons[name];
        ownProps.callbackOverrides[name](origHandler);
      };
    });
  }

  return props;
}

export default connect(mapStateToProps)(FormButtonsRedux);
