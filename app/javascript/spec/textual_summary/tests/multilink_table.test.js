import React from 'react';
import { render } from '@testing-library/react';
import MultilinkTable from '../../../components/textual_summary/multilink_table';
import { multilinkTableData } from '../data/multilink_table';

describe('MultilinkTable', () => {
  const onClick = jest.fn();

  it('renders just fine', () => {
    const { container } = render(
      <MultilinkTable
        title={multilinkTableData.title}
        items={multilinkTableData.items}
        onClick={onClick}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
