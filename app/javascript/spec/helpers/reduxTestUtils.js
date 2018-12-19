/**
 * run an action (sync or async) and except the results to much snapshot
 * @param  {Function}  runAction  Action runner function
 * @return {Promise}
 */
export const testActionSnapshot = async(runAction) => {
  const actionResults = runAction();

  // if it's an async action
  if (typeof actionResults === 'function') {
    const dispatch = jest.fn();
    await actionResults(dispatch);

    expect(dispatch.mock.calls).toMatchSnapshot();
  } else {
    expect(actionResults).toMatchSnapshot();
  }
};

/**
 * Test a reducer with fixtures and snapshots
 * @param  {Function} reducer  reducer to test
 * @param  {Object}   fixtures key=fixture description, value=props to apply
 */
export const testReducerSnapshotWithFixtures = (reducer, fixtures) => {
  const reduce = ({ state, action = {} } = {}) => reducer(state, action);
  Object.entries(fixtures).forEach(([description, action]) =>
    it(description, () => expect(reduce(action)).toMatchSnapshot()));
};
