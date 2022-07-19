import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import MiqStructuredList from '../../components/miq-structured-list';
import { genericGroupData } from '../textual_summary/data/generic_group';
import { multilinkTableData } from '../textual_summary/data/multilink_table';
import { operationRangesData } from '../textual_summary/data/operation_ranges';
import { simpleTableData, buildInstance } from '../textual_summary/data/simple_table';
import { tableListViewData } from '../textual_summary/data/table_list_view';
import { tagGroupData } from '../textual_summary/data/tag_group';

describe('Structured list component', () => {
  it('should render a simple_table with generic data', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={genericGroupData.items}
      title={genericGroupData.title}
      mode="simple_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a multilink_list table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={multilinkTableData.items}
      title={multilinkTableData.title}
      mode="multilink_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a operation_range table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={operationRangesData.items}
      title={operationRangesData.title}
      mode="operation_ranges"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a tag_group table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={tagGroupData.items}
      title={tagGroupData.title}
      mode="tag_group"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a simple_table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={simpleTableData.items}
      title={simpleTableData.title}
      mode="simple_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a simple_table with sortable and expandable data', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      headers={buildInstance.labels}
      rows={buildInstance.items}
      title={buildInstance.title}
      mode="simple_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a table_list_view table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      headers={tableListViewData.headers}
      rows={tableListViewData.items}
      title={tableListViewData.title}
      mode="table_list_view"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
