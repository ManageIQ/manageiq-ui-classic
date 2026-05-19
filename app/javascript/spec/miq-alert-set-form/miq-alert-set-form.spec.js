import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import MiqAlertSetForm from '../../components/miq-alert-set-form/index';

describe('Alert Profile Form Component', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      mode: [['Host', 'Host']],
      emsId: 'Host',
      alertState: [
        { label: 'Host Datastore < 5% of Free Space', value: '1' },
        {
          label: 'Host  Event Log Error - Failed to validate VM IP address',
          value: '2',
        },
        {
          label: 'Host Event Log Error - Memory Exceed Soft Limit ',
          value: '3',
        },
        { label: 'Host VMs >10', value: '10' },
      ],
    };
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render correctly', async() => {
    const { container } = renderWithRedux(
      <MiqAlertSetForm {...initialProps} />
    );

    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
