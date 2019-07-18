import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import { DataDrivenTable } from '../../components/simple-table/simple-table';

describe('Simple react table', () => {
  let initialProps;
  const clickSpy = jest.fn();
  beforeEach(() => {
    initialProps = {
      columns: [
        ['column-one', 'First label'],
        ['column-two', 'Second label', { className: 'custom-className-of-cells' }],
      ],
      rows: [{
        'column-one': 'Row 1 first column',
        'column-two': <span>Custom component for column 2 row 1</span>,
      }, {
        'column-one': 'Row 2 second column',
        'column-two': <button type="button" onClick={() => clickSpy('foo')} className="button pf-button">Click me!</button>,
      }],
    };
  });

  afterEach(() => {
    clickSpy.mockReset();
  });

  it('should render correctly', () => {
    const wrapper = mount(<DataDrivenTable {...initialProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should call callback on custom button cell component', () => {
    const wrapper = mount(<DataDrivenTable {...initialProps} />);
    wrapper.find('button').simulate('click');
    expect(clickSpy).toHaveBeenCalledWith('foo');
  });
});
