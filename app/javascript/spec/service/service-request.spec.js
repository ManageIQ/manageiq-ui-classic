import { screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import Service from '../../components/service';
import { ServiceType } from '../../components/service/constants';
import { serviceDialogResponse } from './data';

describe('Service component - Service Request', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should render the Service component for serviceRequest that renders all fields', async() => {
    const initialData = {
      dialogId: 118,
      requestDialogOptions: {
        dialog_text_box_1: 0,
        dialog_textarea_box_1: 'AAA',
        dialog_check_box_1: 't',
        dialog_dropdown_list_1: '16',
        dialog_dropdown_list_2_1: [
          { label: '3', value: '3' },
          { label: '2', value: '2' },
        ],
        dialog_radio_button_1: '2',
        dialog_date_control_1: '2024-07-11',
        dialog_date_time_control_1: '2024-07-11T15:26:00Z',
        dialog_tag_control_1: [
          { label: 'Database', value: '10' },
          { label: 'DHCP Server', value: '11' },
        ],
      },
    };

    const serviceType = ServiceType.request;

    fetchMock.getOnce(`/api/service_dialogs/${initialData.dialogId}`, {
      body: { content: serviceDialogResponse },
      headers: { 'content-type': 'application/json' },
    });

    const { container } = renderWithRedux(<Service initialData={initialData} serviceType={serviceType} />);

    // serviceRequest converts all fields (including TextArea, Dropdown, Date, DateTime) to
    // read-only TextInput display — wait for one of the field labels to confirm loading is done
    await waitFor(() => expect(document.querySelector('.service-container .cds--text-input')).toBeInTheDocument());

    // No Submit/Cancel buttons for serviceRequest
    expect(screen.queryByText(__('Submit'))).not.toBeInTheDocument();
    expect(screen.queryByText(__('Cancel'))).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
