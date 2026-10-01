import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';

import FlavorForm from '../../components/flavor-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('Flavor form component', () => {
  beforeAll(() => fetchMock.mockGlobal());

  const emsUrl = '/api/providers?expand=resources&attributes=id,name,supports_create_flavor&filter[]=supports_create_flavor=true';

  const emsList = {
    resources: [
      { name: 'foo', id: 1 },
      { name: 'bar', id: 2 },
    ],
  };

  it('matches the snapshot', async() => {
    fetchMock.get(emsUrl, emsList);
    const { container } = renderWithRedux(<FlavorForm redirect="" />);

    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('loads providers via the API', async() => {
    fetchMock.get(emsUrl, emsList);

    renderWithRedux(<FlavorForm redirect="" />);

    await waitFor(() => {
      expect(fetchMock.callHistory.called(emsUrl)).toBe(true);
    });
  });
});
