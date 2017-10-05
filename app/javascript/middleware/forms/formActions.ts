import { UPDATE_FORM, INIT_FORM } from '../../miq-redux/lib'

export function updateForm(payload) {
  return dispatch => dispatch({type: UPDATE_FORM, payload: payload});
}
