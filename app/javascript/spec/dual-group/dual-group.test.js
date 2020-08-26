import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import DualGroup from '../../components/dual-group';

jest.mock('@@ddf', () => ({
  useFormApi: () => ({
    renderForm: ([{ name }]) => `hello ${name}`,
  }),
}));


describe('Dual group component', () => {
  const initialProps = {
    name: 'dualgroup',
    fields: [
      { name: 'John' },
      { name: 'Arthur' },
    ],
  };

  const origConsole = [];

  beforeEach(() => {
    origConsole.error = window.console.error;
    window.console.error = jest.fn();
  });

  afterEach(() => {
    window.console.error = origConsole.error;
  });

  it('should render', () => {
    const wrapper = mount(<DualGroup {...initialProps} />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should throw error', () => {
    try {
      mount(<DualGroup {...initialProps} fields={[...initialProps.fields, { name: 'Dutch' }, { name: 'Micah' }, { name: 'Hosea' }]} />);
    } catch (error) {
      expect(error.message).toEqual('Length of fields (DualGroup component: dualgroup) has to be a divisor of 12: 1,2,3,4,6,12. You have: 5');
    }
  });
});
