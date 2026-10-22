import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import VisualSettingsForm from '../../components/visual-settings-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('visual settings form', () => {
  const shortcuts = '/api/shortcuts?expand=resources&attributes=description,url';
  const users = '/api/users/1?attributes=settings';

  window.locales = [];

  beforeAll(() => fetchMock.mockGlobal());

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

  it('calls the API endpoints to preseed the form', async() => {
    const { container } = renderWithRedux(<VisualSettingsForm recordId="1" />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(fetchMock.callHistory.called(shortcuts)).toBe(true);
    expect(fetchMock.callHistory.called(users)).toBe(true);
    expect(fetchMock.callHistory.called('/api')).toBe(true);
  });

  it('matches the snapshot', async() => {
    const { container } = renderWithRedux(<VisualSettingsForm recordId="1" />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
