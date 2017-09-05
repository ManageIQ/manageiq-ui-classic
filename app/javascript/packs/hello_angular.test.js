/** global: jest */
import './application-common';

describe('it should log to the console hello angular', () => {
  window.console.log = jest.fn();
  expect(window.console.log).toBeCalled();
});
