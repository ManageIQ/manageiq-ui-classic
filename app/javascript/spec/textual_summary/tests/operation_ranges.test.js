import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import OperationRanges from '../../../components/textual_summary/operation_ranges';
import { operationRangesData } from '../data/operation_ranges';

describe('Operation Ranges', () => {
  it('renders just fine...', () => {
    const table = mount(<OperationRanges title={operationRangesData.title} items={operationRangesData.items} />);
    expect(toJson(table)).toMatchSnapshot();
  });
});
