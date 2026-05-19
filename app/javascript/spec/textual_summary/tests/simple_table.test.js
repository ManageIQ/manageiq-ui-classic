import React from 'react';
import { render } from '@testing-library/react';
import SimpleTable from '../../../components/textual_summary/simple_table';
import { simpleTableData } from '../data/simple_table';

describe('Simple Table', () => {
  it('renders just fine...', () => {
    const onClick = jest.fn();
    /*
     * label:
     *   a) simple
     *   b) object {sortable: true} TODO
     * rows
     *   value:
     *     a) simple
     *     b) object {expandable: true} TODO
     */
    const { container } = render(
      <SimpleTable
        title={simpleTableData.title}
        labels={simpleTableData.labels}
        rows={simpleTableData.rows}
        onClick={onClick}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
