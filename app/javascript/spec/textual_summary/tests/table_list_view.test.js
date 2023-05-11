import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import TableListView from '../../../components/textual_summary/table_list_view';
import { tableListViewData } from '../data/table_list_view';

describe('TableListView', () => {
  it('renders just fine...', () => {
    const row = mount(<TableListView
      title={tableListViewData.title}
      headers={tableListViewData.headers.map((item) => item.label)}
      values={tableListViewData.values}
      colOrder={tableListViewData.colOrder}
      rowLabel="View the table"
      onClick={() => null}
    />);
    expect(toJson(row)).toMatchSnapshot();
  });
});
