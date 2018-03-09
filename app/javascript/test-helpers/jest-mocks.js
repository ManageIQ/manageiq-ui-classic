import { merge } from 'lodash';

function deepArgMapper(arg) {
  if (Array.isArray(arg)) {
    return arg.map(deepArgMapper);
  }
  if (arg !== null && typeof arg === 'object') {
    return merge({}, arg);
  }
  return arg;
}

/**
 * Jest mock function call arguments are held by reference only.
 * There is no `spy.calls.saveArgumentsByValue` like in Jasmine.
 *
 * This helper complements the `jest.spyOn` API with the ability
 * to deep-clone mock function call arguments (excluding objects
 * which aren't inherently serializable, like functions).
 */
export function spyOnDeeply(object, methodName) {
  const mock = jest.fn();
  const method = object[methodName];
  object[methodName] = function () {
    mock.apply(null, Array.prototype.map.call(arguments, deepArgMapper));
    return method.apply(object, arguments);
  };
  return mock;
}
