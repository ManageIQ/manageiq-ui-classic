import { screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import Service from '../../components/service';
import { ServiceType } from '../../components/service/constants';
import { serviceDialogResponse } from './data';
import { API } from '../../http_api';

jest.mock('../../http_api', () => ({
  API: {
    get: jest.fn(),
    post: jest.fn().mockResolvedValue({ success: true }),
  },
}));

describe('Service component - Service Reconfigure', () => {
  const serviceId = 123;

  const initialData = {
    dialogId: 118,
    params: {
      resourceActionId: 8732,
      targetId: serviceId,
      targetType: 'service',
    },
    urls: {
      apiSubmitEndpoint: `/api/services/${serviceId}`,
      apiAction: 'reconfigure',
      cancelEndPoint: '/service/show_list',
      finishSubmitEndpoint: '/miq_request/show_list?typ=service/',
      openUrl: false,
    },
  };

  afterEach(() => {
    fetchMock.restore();
    jest.clearAllMocks();
  });

  it('should render the Service component for serviceReconfigure with all fields', async() => {
    API.get.mockResolvedValueOnce({
      id: serviceId,
      reconfigure_dialog: serviceDialogResponse,
    });

    const { container } = renderWithRedux(
      <Service initialData={initialData} serviceType={ServiceType.reconfigure} />
    );

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    expect(screen.getByText(__('Cancel'))).toBeInTheDocument();
    expect(document.querySelector('.service-container.serviceReconfigure')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should respect read_only fields in reconfigure mode', async() => {
    const dialog = JSON.parse(JSON.stringify(serviceDialogResponse));
    // First field (TextBox) — editable
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[0].read_only = false;
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[0].reconfigurable = true;
    // Second field (TextArea) — read-only
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[1].read_only = true;

    API.get.mockResolvedValueOnce({
      id: serviceId,
      reconfigure_dialog: dialog,
    });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.reconfigure} />);

    await waitFor(() => expect(document.querySelector('.service-container textarea')).toBeInTheDocument());

    const textInput = document.querySelector('input[type="text"]');
    const textArea = document.querySelector('textarea');

    expect(textInput.readOnly).toBe(false);
    expect(textArea.readOnly).toBe(true);
  });
});
