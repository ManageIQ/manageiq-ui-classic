import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import MiqAlertSetForm from '../../components/miq-alert-set-form/index';

describe('Alert Profile Form Component', () => {
  const initialProps = {
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

  it('should render correctly', async() => {
    const { container, getByText } = renderWithRedux(
      <MiqAlertSetForm {...initialProps} />
    );

    await waitFor(() => {
      expect(getByText('Available Alerts:')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
