import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';

import FlavorForm from '../../components/flavor-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('Flavor form component', () => {
  const emsUrl = '/api/providers?expand=resources&attributes=id,name,supports_create_flavor&filter[]=supports_create_flavor=true';

  const emsList = {
    resources: [
      { name: 'foo', id: 1 },
      { name: 'bar', id: 2 },
    ],
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('matches the snapshot', async() => {
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
      expect(fetchMock.called(emsUrl)).toBe(true);
    });
  });
});
