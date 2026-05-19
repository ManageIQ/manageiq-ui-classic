import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import PxeImageForm from '../../components/pxe-image-type-form/index';
import '../helpers/miqSparkle';

describe('Pxe Image Type Form Component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render adding a new pxe image type', async() => {
    const { container } = renderWithRedux(<PxeImageForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(0);
    expect(container).toMatchSnapshot();
  });

  it('should render editing a pxe image type', async() => {
    fetchMock.get('/api/pxe_image_types/1', {
      name: 'foo',
      provision_type: 'host',
    });

    const { container } = renderWithRedux(<PxeImageForm recordId="1" />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });
});
