import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FormButtons from './form-buttons';

function FormButtonsRedux({ callbackOverrides = {}, ...props }) {
  return <FormButtons callbackOverrides={callbackOverrides} {...props} />;
}

FormButtonsRedux.propTypes = {
  callbackOverrides: PropTypes.shape({
    addClicked: PropTypes.func,
    saveClicked: PropTypes.func,
    resetClicked: PropTypes.func,
    cancelClicked: PropTypes.func,
  }),
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
