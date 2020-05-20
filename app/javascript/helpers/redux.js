/**
 * Combines multiple reducers. The reducers are called in the same order as
 * they were specified in the array. The namespace parameter allow the reducers
 * to be namespaced. When namespace is used then all actions need to have
 * a `namespace` attribute. The reducers in this scenario will be called when
 * the namespace and the action.namespace is matching.
 *
 * @param  {Array}  reducers  Array of reducers to combine.
 * @param  {String} namespace Optional namespace of the reducers.
 * @return {Object}           Store
 */
export const combineReducers = (reducers, namespace) => (store = {}, action) => {
  // If the store is namespaced and is not called on the current namespace, skip
  if (typeof namespace !== 'undefined' && namespace !== action.namespace) {
    return store;
  }

  let result = store;
  reducers.forEach((item) => {
    result = item(result, action);
  });

  return result;
};
