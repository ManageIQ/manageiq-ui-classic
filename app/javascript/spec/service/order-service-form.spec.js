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

describe('Service component - Order Service', () => {
  const initialData = {
    dialogId: 118,
    params: {
      resourceActionId: 8732,
      targetId: 170,
      targetType: 'service_template',
      realTargetType: 'ServiceTemplate',
    },
    urls: {
      apiSubmitEndpoint: '/api/service_catalogs/7/service_templates/170',
      apiAction: 'order',
      cancelEndPoint: '/catalog/explorer',
      finishSubmitEndpoint: '/miq_request/show_list',
      openUrl: false,
    },
    requestDialogOptions: undefined,
  };

  const mockDialogFetch = () => {
    API.get.mockResolvedValueOnce({ id: 118, content: serviceDialogResponse });
  };

  const mockDialogFetchAllOptional = () => {
    const dialog = JSON.parse(JSON.stringify(serviceDialogResponse));
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields.forEach((f) => { f.required = false; });
    API.get.mockResolvedValueOnce({ id: 118, content: dialog });
  };

  afterEach(() => {
    fetchMock.restore();
    jest.clearAllMocks();
  });

  it('renders all field types and the Submit and Cancel buttons', async() => {
    mockDialogFetch();

    const { container } = renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    expect(screen.getByText(__('Cancel'))).toBeInTheDocument();
    expect(document.querySelector('.service-container')).toBeInTheDocument();
    expect(document.querySelector('.refresh-field-item button')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('submits the form with the correct payload and redirects on success', async() => {
    const user = userEvent.setup();
    mockDialogFetchAllOptional();
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        '/api/service_catalogs/7/service_templates/170',
        expect.objectContaining({ action: 'order' }),
        { skipErrors: [400] }
      );
    });

    await waitFor(() => {
      expect(miqRedirectBack).toHaveBeenCalledWith(
        __('Order Request was Submitted'),
        'success',
        '/miq_request/show_list'
      );
    });
  });

  it('shows an error flash and does not redirect when the API call fails', async() => {
    const user = userEvent.setup();
    mockDialogFetchAllOptional();
    API.post.mockRejectedValueOnce(new Error('server error'));
    window.add_flash = jest.fn();

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      expect(window.add_flash).toHaveBeenCalledWith(__('Error submitting request'), 'error');
    });

    expect(miqRedirectBack).not.toHaveBeenCalled();
  });

  it('disables the Submit button while the request is in-flight', async() => {
    const user = userEvent.setup();
    mockDialogFetchAllOptional();
    // Never resolves — keeps the request pending
    API.post.mockReturnValueOnce(new Promise(() => {}));

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

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

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Cancel'))).toBeInTheDocument());

    await user.click(screen.getByText(__('Cancel')));

    expect(miqRedirectBack).toHaveBeenCalledWith(
      __('Dialog Cancelled'),
      'warning',
      '/catalog/explorer'
    );
  });

  it('clicking the refresh button on a dynamic field triggers a field refresh', async() => {
    const user = userEvent.setup();
    mockDialogFetch();
    API.post.mockResolvedValueOnce({
      result: {
        dropdown_list_1: {
          data_type: 'string',
          default_value: '99',
          dialog_field_responders: [],
          options: {},
          read_only: false,
          required: false,
          validator_rule: null,
          validator_type: null,
          values: [['99', 'Refreshed Option']],
          visible: true,
        },
      },
    });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(document.querySelector('.refresh-field-item button')).toBeInTheDocument());

    await user.click(document.querySelector('.refresh-field-item button'));

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        '/api/service_dialogs/118',
        expect.objectContaining({ action: 'refresh_dialog_fields' })
      );
    });
  });
});
