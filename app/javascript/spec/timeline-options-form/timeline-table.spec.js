import React from 'react';
import { waitFor } from '@testing-library/react';
import TimelineTable from '../../components/timeline-options/timeline-table';
import { renderWithRedux } from '../helpers/mountForm';
import { tableSampleData } from './sample-table-data';

describe('Show Timeline Page', () => {
  it('should render empty page', async() => {
    const { container } = renderWithRedux(<TimelineTable data={[]} />);

    await waitFor(() => {
      expect(
        container.querySelector('.timeline-data-table')
      ).toBeInTheDocument();
    });
    expect(container.querySelector('.miq-data-table')).not.toBeInTheDocument();
  });

  it('should render a table with data', async() => {
    const { container } = renderWithRedux(
      <TimelineTable data={tableSampleData} />
    );

    await waitFor(() => {
      expect(
        container.querySelector('.timeline-data-table')
      ).toBeInTheDocument();
    });
    expect(container.querySelector('.miq-data-table')).toBeInTheDocument();
  });
});
