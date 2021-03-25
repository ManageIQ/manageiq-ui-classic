import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import MultilinkTable from '../../../components/textual_summary/multilink_table';
import { multilinkTableData } from '../data/multilink_table';

describe('MultilinkTable', () => {
  it('renders just fine', () => {
    const table = mount(<MultilinkTable
      title={multilinkTableData.title}
      items={multilinkTableData.items}
      onClick={() => null}
    />);
    expect(toJson(table)).toMatchSnapshot();
  });
});
