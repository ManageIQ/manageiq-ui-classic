import AwesomeDebouncePromise from 'awesome-debounce-promise';

export default (asyncFunction, debounceTime = 250, options = undefined) => AwesomeDebouncePromise(
  asyncFunction,
  debounceTime,
  options,
);
