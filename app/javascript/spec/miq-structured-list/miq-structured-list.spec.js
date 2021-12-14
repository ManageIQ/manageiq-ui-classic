import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import MiqStructuredList from '../../components/miq-structured-list';
import { genericGroupData } from '../textual_summary/data/generic_group';
import { multilinkTableData } from '../textual_summary/data/multilink_table';
import { operationRangesData } from '../textual_summary/data/operation_ranges';
import { simpleTableData } from '../textual_summary/data/simple_table';
import { tableListViewData } from '../textual_summary/data/table_list_view';
import { tagGroupData } from '../textual_summary/data/tag_group';
import { summary1 } from '../textual_summary/data/textual_summary';

describe('Structured list component', () => {
  it('should render a simple list table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={genericGroupData.items}
      title={genericGroupData.title}
      mode="simple_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a multilink list table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={multilinkTableData.items}
      title={multilinkTableData.title}
      mode="multilink_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a operation range list table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={operationRangesData.items}
      title={operationRangesData.title}
      mode="operation_ranges"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a tag group list table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={tagGroupData.items}
      title={tagGroupData.title}
      mode="tag_group"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a simple table list table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={simpleTableData.items}
      title={simpleTableData.title}
      mode="simple_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
