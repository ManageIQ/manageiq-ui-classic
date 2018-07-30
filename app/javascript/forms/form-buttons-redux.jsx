import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { combineReducers } from 'redux';

import FormButtons from './form-buttons';

function FormButtonsRedux(props) {
  initReducer();

  return <FormButtons {...props} />;
}

FormButtonsRedux.propTypes = {
  callbackOverrides: PropTypes.object,
};

FormButtonsRedux.defaultProps = {
  callbackOverrides: {},
};


function mapStateToProps(state, ownProps) {
  let props = {...state.FormButtons};

  if (state.FormButtons && ownProps.callbackOverrides) {
    // allow overriding click handlers
    // the original handler is passed as the only argument to the new one
    Object.keys(ownProps.callbackOverrides).forEach((name) => {
      props[name] = () => {
        let origHandler = state.FormButtons[name];
        ownProps.callbackOverrides[name](origHandler);
      };
    });
  }

  return props;
}

export default connect(mapStateToProps)(FormButtonsRedux);

function initReducer() {
  if (initReducer.done) {
    // don't init twice
    return;
  }
  initReducer.done = true;


  const initialState = {...FormButtons.defaultProps};

  const actions = {
    'FormButtons.init': (_state, payload) => ({ ...initialState, ...payload }),
    'FormButtons.customLabel': (state, payload) => ({ ...state, customLabel: payload || ''}),
    'FormButtons.newRecord': (state, payload) => ({ ...state, newRecord: !! payload }),
    'FormButtons.pristine': (state, payload) => ({ ...state, pristine: !! payload }),
    'FormButtons.saveable': (state, payload) => ({ ...state, saveable: !! payload }),

    'FormButtons.callbacks': (state, payload) => ({ ...state, ...payload }),
  };


  ManageIQ.redux.addReducer(combineReducers({
    FormButtons: function FormButtonsReducer(state = initialState, action) {

      if (actions[action.type]) {
        return actions[action.type](state, action.payload);
      } else if (action.type.match(/^FormButtons\./)) {
        console.warn(`FormButtonsReducer - unknown action type: ${action.type}`, action);
      }

      return state;
    },
  }));
}
