import React from 'react';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import PxeIsoDatastoreForm from '../../components/pxe-iso-datastore-form/index';

describe('Pxe Iso Datastore Form Component', () => {
  const emses = [
    {
      name: 'provider 1',
      id: 1,
    },
    {
      name: 'provider 2',
      id: 2,
    },
  ];

  it('should render adding a new iso datastore', async() => {
    const { container } = renderWithRedux(
      <PxeIsoDatastoreForm emses={emses} />
    );
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
