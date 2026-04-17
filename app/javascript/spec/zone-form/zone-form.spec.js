import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import ZoneForm from '../../components/zone-form/index';

describe('zone Form Component', () => {
  const zone = {
    authentications: [],
    created_on: '2021-05-13T19:47:24Z',
    description: 'test add zone',
    href: 'http://localhost:3000/api/zones/68',
    id: '68',
    name: 'test add zone name',
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render a new Zone form', () => {
    const { container } = renderWithRedux(<ZoneForm />);
    expect(container).toMatchSnapshot();
  });

  it('should render editing a zone form', async() => {
    fetchMock.get('/api/zones/68?attributes=authentications', zone);
    const { container } = renderWithRedux(<ZoneForm recordId="68" {...zone} />);

    await waitFor(() => {
      expect(fetchMock.called('/api/zones/68?attributes=authentications')).toBe(true);
    });

    const nameInput = container.querySelector('input[name="name"]');
    const descriptionInput = container.querySelector('input[name="description"]');

    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toEqual('test add zone name');
    expect(descriptionInput).toBeInTheDocument();
    expect(descriptionInput.value).toEqual('test add zone');
    expect(container).toMatchSnapshot();
  });
});
