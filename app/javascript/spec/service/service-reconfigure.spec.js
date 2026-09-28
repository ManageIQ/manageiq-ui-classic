import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import Service from '../../components/service';
import { ServiceType } from '../../components/service/constants';
import { serviceDialogResponse } from './data';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

import '../helpers/miqSparkle';

jest.mock('../../http_api', () => ({
  API: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

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

  const mockDialogFetch = (dialog = serviceDialogResponse) => {
    API.get.mockResolvedValueOnce({
      id: serviceId,
      reconfigure_dialog: dialog,
    });
  };

  afterEach(() => {
    fetchMock.restore();
    jest.clearAllMocks();
  });

  it('renders all fields and Submit and Cancel buttons', async() => {
    mockDialogFetch();

    const { container } = renderWithRedux(
      <Service initialData={initialData} serviceType={ServiceType.reconfigure} />
    );

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    expect(screen.getByText(__('Cancel'))).toBeInTheDocument();
    expect(document.querySelector('.service-container.serviceReconfigure')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('submits the form with the reconfigure payload shape and redirects on success', async() => {
    const user = userEvent.setup();
    const dialog = JSON.parse(JSON.stringify(serviceDialogResponse));
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields.forEach((f) => { f.required = false; });
    mockDialogFetch(dialog);
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.reconfigure} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        `/api/services/${serviceId}`,
        expect.objectContaining({ action: 'reconfigure', resource: expect.any(Object) }),
        { skipErrors: [400] }
      );
    });

    await waitFor(() => {
      expect(miqRedirectBack).toHaveBeenCalledWith(
        __('Reconfigure Request was Submitted'),
        'success',
        '/miq_request/show_list?typ=service/'
      );
    });
  });

  it('shows an error flash and does not redirect when the API call fails', async() => {
    const user = userEvent.setup();
    const dialog = JSON.parse(JSON.stringify(serviceDialogResponse));
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields.forEach((f) => { f.required = false; });
    mockDialogFetch(dialog);
    API.post.mockRejectedValueOnce(new Error('server error'));
    window.add_flash = jest.fn();

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.reconfigure} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      expect(window.add_flash).toHaveBeenCalledWith(__('Error submitting request'), 'error');
    });

    expect(miqRedirectBack).not.toHaveBeenCalled();
  });

  it('disables the Submit button while the request is in-flight', async() => {
    const user = userEvent.setup();
    const dialog = JSON.parse(JSON.stringify(serviceDialogResponse));
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields.forEach((f) => { f.required = false; });
    mockDialogFetch(dialog);
    API.post.mockReturnValueOnce(new Promise(() => {}));

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.reconfigure} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      expect(screen.getByText(__('Submitting...'))).toBeInTheDocument();
      expect(screen.getByText(__('Submitting...')).closest('button')).toBeDisabled();
    });
  });

  it('redirects to the cancel endpoint when Cancel is clicked', async() => {
    const user = userEvent.setup();
    mockDialogFetch();

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.reconfigure} />);

    await waitFor(() => expect(screen.getByText(__('Cancel'))).toBeInTheDocument());

    await user.click(screen.getByText(__('Cancel')));

    expect(miqRedirectBack).toHaveBeenCalledWith(
      __('Dialog Cancelled'),
      'warning',
      '/service/show_list'
    );
  });

  it('respects read_only fields in reconfigure mode', async() => {
    const dialog = JSON.parse(JSON.stringify(serviceDialogResponse));
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[0].read_only = false;
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[0].reconfigurable = true;
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[1].read_only = true;

    mockDialogFetch(dialog);

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.reconfigure} />);

    await waitFor(() => expect(document.querySelector('.service-container textarea')).toBeInTheDocument());

    expect(document.querySelector('input[type="text"]').readOnly).toBe(false);
    expect(document.querySelector('textarea').readOnly).toBe(true);
  });
});
