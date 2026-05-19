import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import TimelinePage from '../../components/timeline-options/timeline-page';
import { renderWithRedux } from '../helpers/mountForm';

describe('Show Timeline Page', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should render empty page', async() => {
    fetchMock.mock('/api/event_streams', {
      data: {
        timeline_events: {
          EmsEvent: {
            description: 'Management Events',
            group_names: { power: 'Power', other: 'Other' },
            group_levels: { critical: 'Critical', detail: 'Detail' },
          },
          MiqEvent: {
            description: 'Policy Events',
            group_names: { compliance: 'Compliance', other: 'Other' },
            group_levels: { warning: 'Warning', detail: 'Detail' },
          },
        },
      },
    });

    const { container } = renderWithRedux(<TimelinePage id="1" />);
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toBeTruthy();
    // Note: Snapshot testing not used because date fields change dynamically to the current date
  });
});
