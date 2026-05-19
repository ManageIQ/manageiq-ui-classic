import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import PxeIsoImageForm from '../../components/pxe-iso-image-form/index';
import '../helpers/miqSparkle';

describe('Pxe Edit Iso Image Form Component', () => {
  const api = {
    resources: [
      {
        name: 'pxe-image-type1',
        id: '1',
      },
      {
        name: 'pxe-image-type2',
        id: '2',
      },
    ],
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render editing a iso image', async() => {
    fetchMock.get(
      '/api/pxe_image_types?attributes=name,id&expand=resources',
      api
    );
    fetchMock.get('/api/iso_images/1', { pxe_image_type_id: '1' });

    const { container } = renderWithRedux(<PxeIsoImageForm recordId="1" />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(3);
    expect(container).toMatchSnapshot();
  });
});
