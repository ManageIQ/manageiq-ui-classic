import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import Service from '../../components/service';
import { ServiceType } from '../../components/service/constants';
import { serviceDialogResponse, payloadTestDialogResponse, regexTestDialogResponse } from './data';
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

  const openUrlInitialData = {
    ...initialData,
    urls: {
      ...initialData.urls,
      openUrl: 'true',
    },
  };

  const mockDialogFetch = () => {
    API.get.mockResolvedValueOnce({ id: 118, content: serviceDialogResponse });
  };

  const mockDialogFetchAllOptional = () => {
    const dialog = JSON.parse(JSON.stringify(serviceDialogResponse));
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields.forEach((f) => {
      f.required = false;
    });
    API.get.mockResolvedValueOnce({ id: 118, content: dialog });
  };

  afterEach(() => {
    fetchMock.restore();
    jest.clearAllMocks();
    delete window.$http;
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

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      expect(screen.getByText(__('Error submitting request'))).toBeInTheDocument();
    });

    expect(miqRedirectBack).not.toHaveBeenCalled();
    // Submit re-enables after error so the user can retry
    expect(screen.getByText(__('Submit')).closest('button')).not.toBeDisabled();
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
      'info',
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

  it('opens the URL returned by Automate and redirects when openUrl is enabled', async() => {
    const user = userEvent.setup();
    mockDialogFetchAllOptional();

    API.post.mockResolvedValueOnce({ task_id: 'task-abc' });
    API.wait_for_task = jest.fn().mockResolvedValueOnce({ state: 'Finished', status: 'Ok' });
    window.$http = {
      post: jest.fn().mockResolvedValueOnce({ data: { open_url: 'https://example.com/vm/1' } }),
    };
    window.open = jest.fn();

    renderWithRedux(<Service initialData={openUrlInitialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());
    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      expect(API.wait_for_task).toHaveBeenCalledWith('task-abc');
    });

    await waitFor(() => {
      expect(window.$http.post).toHaveBeenCalledWith(
        'open_url_after_dialog',
        { targetId: 170, realTargetType: 'ServiceTemplate' }
      );
    });

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('https://example.com/vm/1');
      expect(miqRedirectBack).toHaveBeenCalledWith(
        __('Order Request was Submitted'),
        'success',
        '/miq_request/show_list'
      );
    });
  });

  it('shows an Automate URL error flash when openUrl is enabled but no URL is returned', async() => {
    const user = userEvent.setup();
    mockDialogFetchAllOptional();

    API.post.mockResolvedValueOnce({ task_id: 'task-xyz' });
    API.wait_for_task = jest.fn().mockResolvedValueOnce({ state: 'Finished', status: 'Ok' });
    window.$http = {
      post: jest.fn().mockResolvedValueOnce({ data: { open_url: null } }),
    };
    window.open = jest.fn();

    renderWithRedux(<Service initialData={openUrlInitialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());
    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      expect(screen.getByText(__('Automate failed to obtain URL.'))).toBeInTheDocument();
    });

    expect(window.open).not.toHaveBeenCalled();
    expect(miqRedirectBack).not.toHaveBeenCalled();
  });

  // Payload shape

  it('sends text field value, checkbox as t/f, and single-select id in the submit payload', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({ id: 200, content: payloadTestDialogResponse });
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      const [, body] = API.post.mock.calls[0];
      // TextBox default value passed through as-is
      expect(body.my_text).toBe('hello');
      // CheckBox: default_value 't' → initialised as true → reformatValue → 't'
      expect(body.my_checkbox).toBe('t');
      // Single dropdown: default_value '1' → item {id:'1', text:'One'} → processDropdownOrTag → '1'
      expect(body.my_single_dd).toBe('1');
    });
  });

  it('sends multi-select as an array of id strings in the submit payload', async() => {
    const user = userEvent.setup();
    const dialog = JSON.parse(JSON.stringify(payloadTestDialogResponse));
    API.get.mockResolvedValueOnce({ id: 200, content: dialog });
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    // Open the multi-select and choose Alpha and Beta
    const multiSelectInput = document.querySelector('#section-field-row-my_multi_dd input');
    await user.click(multiSelectInput);
    await user.click(screen.getByText('Alpha'));
    await user.click(screen.getByText('Beta'));

    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      const [, body] = API.post.mock.calls[0];
      expect(Array.isArray(body.my_multi_dd)).toBe(true);
      expect(body.my_multi_dd).toEqual(['a', 'b']);
    });
  });

  it('excludes invisible fields from the submit payload', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({ id: 200, content: payloadTestDialogResponse });
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      const [, body] = API.post.mock.calls[0];
      // visible:false field must not appear in the payload
      expect(body).not.toHaveProperty('invisible_field');
    });
  });

  // Validation UI

  it('keeps Submit disabled when a required text field is empty and enables it after input', async() => {
    const user = userEvent.setup();
    const dialog = JSON.parse(JSON.stringify(payloadTestDialogResponse));
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[0].required = true;
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[0].default_value = '';
    API.get.mockResolvedValueOnce({ id: 200, content: dialog });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    expect(screen.getByText(__('Submit')).closest('button')).toBeDisabled();

    await user.type(document.querySelector('input[type="text"]'), 'filled');

    await waitFor(() => {
      expect(screen.getByText(__('Submit')).closest('button')).not.toBeDisabled();
    });
  });

  it('keeps Submit disabled when regex validation fails and enables it when input matches', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({ id: 400, content: regexTestDialogResponse });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    // Empty required field → invalid
    expect(screen.getByText(__('Submit')).closest('button')).toBeDisabled();

    // Non-matching input → still invalid
    const input = document.querySelector('input[type="text"]');
    await user.type(input, 'abc');
    expect(screen.getByText(__('Submit')).closest('button')).toBeDisabled();

    // Clear and type matching digits → valid
    await user.clear(input);
    await user.type(input, '42');

    await waitFor(() => {
      expect(screen.getByText(__('Submit')).closest('button')).not.toBeDisabled();
    });
  });
});
