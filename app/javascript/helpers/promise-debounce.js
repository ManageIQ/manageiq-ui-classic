import AwesomeDebouncePromise from 'awesome-debounce-promise';

export default (asyncFunction, debounceTime = 250, options = { onlyResolvesLast: false }) => AwesomeDebouncePromise(
  asyncFunction,
  debounceTime,
  options,
);
