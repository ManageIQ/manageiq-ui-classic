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
};

FormButtonsRedux.defaultProps = {
};


function mapStateToProps(state) {
  return {...state.FormButtons};
}

export default connect(mapStateToProps)(FormButtonsRedux);

function initReducer() {
  if (! ManageIQ.redux || ! ManageIQ.redux.addReducer) {
    // login screen
    return;
  }
  if (initReducer.done) {
    // don't init twice
    return;
  }
  initReducer.done = true;


  const initialState = {
    customLabel: '',
    newRecord: false,
    pristine: false,
    saveable: true,
  };

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
