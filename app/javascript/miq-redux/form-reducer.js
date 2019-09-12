export const SET_PRISTINE = '@@data-driven-forms/set-pristine';

export const setPristine = pristine => ({
  type: SET_PRISTINE,
  payload: {
    pristine,
  },
});

export const reducer = (state = { pristine: true }, action) => {
  switch (action.type) {
    case SET_PRISTINE:
      return { ...state, pristine: action.payload.pristine };
    default:
      return state;
  }
};
