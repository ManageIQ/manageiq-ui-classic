import React from 'react';
import { render } from '@testing-library/react';
import TableListView from '../../../components/textual_summary/table_list_view';
import { tableListViewData } from '../data/table_list_view';

describe('TableListView', () => {
  it('renders just fine...', () => {
    const onClick = jest.fn();

    const { container } = render(
      <TableListView
        title={tableListViewData.title}
        headers={tableListViewData.headers.map((item) => item.label)}
        values={tableListViewData.values}
        colOrder={tableListViewData.colOrder}
        rowLabel="View the table"
        onClick={onClick}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
