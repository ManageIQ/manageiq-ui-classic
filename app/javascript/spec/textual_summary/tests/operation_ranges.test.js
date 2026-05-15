import React from 'react';
import { render } from '@testing-library/react';
import OperationRanges from '../../../components/textual_summary/operation_ranges';
import { operationRangesData } from '../data/operation_ranges';

describe('Operation Ranges', () => {
  it('renders just fine...', () => {
    const { container } = render(
      <OperationRanges
        title={operationRangesData.title}
        items={operationRangesData.items}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
