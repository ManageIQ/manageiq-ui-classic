import React from 'react';
import { waitFor } from '@testing-library/react';
import ServiceRequestDefault from '../../components/service-request-default';
import { renderWithRedux } from '../helpers/mountForm';
import { sampleData } from './dummy-data';

describe('Show Service Request Page', () => {
  it('should render', async() => {
    const { container } = renderWithRedux(
      <ServiceRequestDefault miqRequestInitialOptions={sampleData} />
    );
    await waitFor(() => {
      expect(
        container.querySelector('.service-request-form')
      ).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
