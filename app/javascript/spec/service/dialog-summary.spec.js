import { screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import Service from '../../components/service';
import { ServiceType } from '../../components/service/constants';
import { serviceDialogResponse } from './data';

describe('Service component - Dialog Summary', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should render the Service component for dialogSummary that renders all fields', async() => {
    const initialData = {
      dialogId: 118,
    };
    const serviceType = ServiceType.dialog;

    fetchMock.getOnce(`/api/service_dialogs/${initialData.dialogId}`, {
      body: { content: serviceDialogResponse },
      headers: { 'content-type': 'application/json' },
    });

    const { container } = renderWithRedux(<Service initialData={initialData} serviceType={serviceType} />);

    await waitFor(() => expect(document.querySelector('.service-container textarea')).toBeInTheDocument());

    // No Submit/Cancel buttons for dialogSummary
    expect(screen.queryByText(__('Submit'))).not.toBeInTheDocument();
    expect(screen.queryByText(__('Cancel'))).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
