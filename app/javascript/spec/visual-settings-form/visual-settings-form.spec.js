import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import VisualSettingsForm from '../../components/visual-settings-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('visual settings form', () => {
  const shortcuts = '/api/shortcuts?expand=resources&attributes=description,url';
  const users = '/api/users/1?attributes=settings';

  window.locales = [];

  beforeEach(() => {
    fetchMock.get(shortcuts, {
      resources: [
        {
          url: 'foo',
          description: 'bar',
        },
      ],
    });
    fetchMock.get(users, { settings: {} });
    fetchMock.get('/api', { timezones: [] });
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('calls the API endpoints to preseed the form', async() => {
    const { container } = renderWithRedux(<VisualSettingsForm recordId="1" />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(fetchMock.called(shortcuts)).toBe(true);
    expect(fetchMock.called(users)).toBe(true);
    expect(fetchMock.called('/api')).toBe(true);
  });

  it('matches the snapshot', async() => {
    const { container } = renderWithRedux(<VisualSettingsForm recordId="1" />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
