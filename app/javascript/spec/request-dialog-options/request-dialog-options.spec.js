import React from 'react';
import toJson from 'enzyme-to-json';
import { mount, shallow } from 'enzyme';
import RequestDialogOptions from '../../components/request-dialog-options';
import { data } from './data';

describe('RequestDialogOptions component', () => {
  it('dialog options should contain total 2 tabs', () => {
    const wrapper = shallow(<RequestDialogOptions data={data} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('.dialog-option-tab')).toHaveLength(data.length);
  });

  it('dialog options should contain total 4 sections', () => {
    const wrapper = mount(<RequestDialogOptions data={data} />);
    const length = data
      .map((item) => item.content.length) // Extract lengths of 'content'
      .reduce((total, length) => total + length, 0); // Calculate the sum
    expect(wrapper.find('.bx--tab-content ul')).toHaveLength(length);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('dialog options should contain 1 checkbox', () => {
    const wrapper = mount(<RequestDialogOptions data={data} />);
    expect(wrapper.exists('input[type="checkbox"]')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('dialog options should contain total 13 rows', () => {
    const wrapper = mount(<RequestDialogOptions data={data} />);
    const length = data.reduce((sum, tab) => {
      const tabContentRows = tab.content.flatMap((section) => section.rows);
      return sum + tabContentRows.length;
    }, 0);
    expect(wrapper.find('.bx--structured-list-row')).toHaveLength(length);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
