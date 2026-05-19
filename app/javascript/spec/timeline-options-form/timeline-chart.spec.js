import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import TimelineChart from '../../components/timeline-options/timeline-chart';

describe('Show Timeline Chart', () => {
  it('should render empty chart', async() => {
    const { container } = render(<TimelineChart />);
    await waitFor(() => {
      expect(container.querySelector('.chart-holder')).toBeInTheDocument();
    });

    // Note: Snapshot testing not used because chart generates dynamic IDs (e.g., chart-clip-id-56801322452)
    // that change on each render, making snapshots unstable
    expect(
      container.querySelector('.cds--cc--chart-wrapper')
    ).toBeInTheDocument();
    expect(container.querySelector('.cds--cc--axes')).toBeInTheDocument();
    expect(container.querySelector('.cds--cc--line')).toBeInTheDocument();

    const showAsTableButtons = screen.getAllByRole('button', {
      name: 'Show as table',
    });
    expect(showAsTableButtons.length).toBeGreaterThan(0);
    const moreOptionsButtons = screen.getAllByRole('button', {
      name: 'More options',
    });
    expect(moreOptionsButtons.length).toBeGreaterThan(0);
  });
});
