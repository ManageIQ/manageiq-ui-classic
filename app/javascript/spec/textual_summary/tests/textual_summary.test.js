import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { TextualSummary } from '../../../components/textual_summary/index';
import { summary1 } from '../data/textual_summary';

describe('TextualSummary', () => {
  it('renders just fine', () => {
    const group = mount(<TextualSummary summary={summary1} onClick={() => null} />);
    expect(toJson(group)).toMatchSnapshot();
  });
});
