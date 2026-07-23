import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import FormButtons from './form-buttons';

function FormButtonsRedux({ callbackOverrides = {}, ...props }) {
  const formButtonsState = useSelector((state) => state.FormButtons);

  const stateProps = { ...formButtonsState };

  if (formButtonsState && callbackOverrides) {
    Object.keys(callbackOverrides).forEach((name) => {
      stateProps[name] = () => {
        const origHandler = formButtonsState[name];
        callbackOverrides[name](origHandler);
      };
    });
  }

  return <FormButtons callbackOverrides={callbackOverrides} {...stateProps} {...props} />;
}

FormButtonsRedux.propTypes = {
  callbackOverrides: PropTypes.shape({
    addClicked: PropTypes.func,
    saveClicked: PropTypes.func,
    resetClicked: PropTypes.func,
    cancelClicked: PropTypes.func,
  }),
};

export default FormButtonsRedux;
