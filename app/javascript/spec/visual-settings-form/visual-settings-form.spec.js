import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import VisualSettingsForm from '../../components/visual-settings-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('visual settings form', () => {
  const shortcuts = '/api/shortcuts?expand=resources&attributes=description,url';
  const users = '/api/users/1?attributes=settings';

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

  it('renders available locales when passed', async() => {
    const locales = [['Deutsch', 'de'], ['English', 'en']];
    const { container } = renderWithRedux(<VisualSettingsForm recordId="1" locales={locales} />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    const select = container.querySelector('select[name="display.locale"]');
    expect(select).toBeInTheDocument();
    expect(select.children).toHaveLength(3);
    expect(select.children[0]).toHaveValue('default');
    expect(select.children[1]).toHaveValue('de');
    expect(select.children[1]).toHaveTextContent('Deutsch');
    expect(select.children[2]).toHaveValue('en');
    expect(select.children[2]).toHaveTextContent('English');
  });

  it('matches the snapshot', async() => {
    const { container } = renderWithRedux(<VisualSettingsForm recordId="1" />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
