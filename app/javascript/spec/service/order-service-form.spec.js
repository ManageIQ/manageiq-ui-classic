import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import Service from '../../components/service';
import { ServiceType } from '../../components/service/constants';
import { serviceDialogResponse, payloadTestDialogResponse, regexTestDialogResponse } from './data';
import { API, http } from '../../http_api';
import { extractDate, extractDateTime } from '../../components/service/helper.dateTime';
import miqRedirectBack from '../../helpers/miq-redirect-back';

import '../helpers/miqSparkle';

jest.mock('../../http_api', () => ({
  API: {
    get: jest.fn(),
    post: jest.fn(),
  },
  http: {
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
    http.post.mockResolvedValueOnce({ open_url: 'https://example.com/vm/1' });
    window.open = jest.fn();

    renderWithRedux(<Service initialData={openUrlInitialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());
    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      expect(API.wait_for_task).toHaveBeenCalledWith('task-abc');
    });

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith(
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
    http.post.mockResolvedValueOnce({ open_url: null });
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
      // Single dropdown: default_value '1' is matched to the item {id:'1', text:'One'} → processDropdownOrTag → '1'
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

  const payloadDialog = (changes = {}) => {
    const dialog = JSON.parse(JSON.stringify(payloadTestDialogResponse));
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields.forEach((f) => {
      if (changes[f.name]) {
        Object.assign(f, changes[f.name]);
      }
    });
    return dialog;
  };

  const submitAndGetBody = async(user) => {
    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());
    await user.click(screen.getByText(__('Submit')));
    await waitFor(() => expect(API.post).toHaveBeenCalled());
    return API.post.mock.calls[0][1];
  };

  // Default values

  it('renders the checkbox as checked for the default "t" and unchecked for "f"', async() => {
    API.get.mockResolvedValueOnce({ id: 200, content: payloadDialog({ my_checkbox: { default_value: 'f' } }) });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByRole('checkbox')).toBeInTheDocument());
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('sends "f" for an untouched checkbox with the default "f" and "t" after it is checked', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({ id: 200, content: payloadDialog({ my_checkbox: { default_value: 'f' } }) });
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByRole('checkbox')).toBeInTheDocument());
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();

    const body = await submitAndGetBody(user);
    expect(body.my_checkbox).toBe('t');
  });

  it('sends "f" when a checked checkbox is unchecked', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({ id: 200, content: payloadTestDialogResponse });
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByRole('checkbox')).toBeChecked());
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    const body = await submitAndGetBody(user);
    expect(body.my_checkbox).toBe('f');
  });

  it('enables Submit for a required dropdown that has a default value', async() => {
    API.get.mockResolvedValueOnce({
      id: 200,
      content: payloadDialog({ my_single_dd: { required: true, default_value: '2' } }),
    });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());
    expect(screen.getByText(__('Submit')).closest('button')).not.toBeDisabled();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('submits the default of a dropdown whose values use integer ids', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({
      id: 200,
      content: payloadDialog({ my_single_dd: { default_value: '2', values: [[1, 'One'], [2, 'Two']] } }),
    });
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    const body = await submitAndGetBody(user);
    expect(body.my_single_dd).toBe('2');
  });

  it('preselects the multi-select items listed in the default value', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({
      id: 200,
      content: payloadDialog({ my_multi_dd: { default_value: '["a","c"]' } }),
    });
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    const body = await submitAndGetBody(user);
    expect(body.my_multi_dd).toEqual(['a', 'c']);
  });

  it('uses the default value of a date field instead of today', async() => {
    API.get.mockResolvedValueOnce({ id: 118, content: serviceDialogResponse });
    const dialogReplaceData = [{ name: 'date_control_1', value: '2026-01-31' }];

    renderWithRedux(<Service initialData={{ ...initialData, dialogReplaceData }} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());
    expect(document.querySelector('input[id^="date_control_1"]').value).toBe('01/31/2026');
  });

  it('renders date and datetime fields whose default value is null', async() => {
    const dialog = JSON.parse(JSON.stringify(serviceDialogResponse));
    dialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields.forEach((f) => {
      if (['DialogFieldDateControl', 'DialogFieldDateTimeControl'].includes(f.type)) {
        f.default_value = null;
      }
    });
    API.get.mockResolvedValueOnce({ id: 118, content: dialog });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());
    expect(document.querySelector('input[id^="date_control_1"]').value).not.toBe('');
  });

  // Custom button dialogs

  it('submits the custom button name as the action', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({ id: 200, content: payloadTestDialogResponse });
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(
      <Service
        initialData={{ ...initialData, urls: { ...initialData.urls, apiSubmitEndpoint: '/api/vms/9', apiAction: 'my_button' } }}
        serviceType={ServiceType.order}
      />
    );

    const body = await submitAndGetBody(user);
    expect(body.action).toBe('my_button');
    expect(API.post.mock.calls[0][0]).toBe('/api/vms/9');
  });

  // Copy request

  it('replaces the dialog defaults with dialogReplaceData', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({ id: 200, content: payloadDialog() });
    API.post.mockResolvedValueOnce({ success: true });
    const dialogReplaceData = [
      { name: 'my_text', value: 'copied' },
      { name: 'my_checkbox', value: 'f' },
      { name: 'my_single_dd', value: '2' },
    ];

    renderWithRedux(<Service initialData={{ ...initialData, dialogReplaceData }} serviceType={ServiceType.order} />);

    const body = await submitAndGetBody(user);
    expect(body.my_text).toBe('copied');
    expect(body.my_checkbox).toBe('f');
    expect(body.my_single_dd).toBe('2');
  });

  // Submit errors

  it('shows each message of a 400 API error as a separate notification', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({ id: 200, content: payloadTestDialogResponse });
    API.post.mockRejectedValueOnce({ data: { error: { message: 'Bad request - Field one is invalid,Field two is invalid' } } });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());
    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => {
      expect(screen.getByText('Field one is invalid')).toBeInTheDocument();
      expect(screen.getByText('Field two is invalid')).toBeInTheDocument();
    });
    expect(screen.getByText(__('Submit')).closest('button')).not.toBeDisabled();
  });

  it('shows an error and stops refreshing when a field refresh fails', async() => {
    const user = userEvent.setup();
    mockDialogFetch();
    API.post.mockRejectedValueOnce(new Error('refresh failed'));

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(document.querySelector('.refresh-field-item button')).toBeInTheDocument());
    await user.click(document.querySelector('.refresh-field-item button'));

    await waitFor(() => {
      expect(screen.getByText(__('Unexpected error occurred when the field was refreshed.'))).toBeInTheDocument();
    });
    // The spinner is gone and the refresh button is back
    expect(document.querySelector('.refresh-field-item .loading')).not.toBeInTheDocument();
    expect(document.querySelector('.refresh-field-item button')).toBeInTheDocument();
  });

  it('keeps earlier changes when several fields are changed one after the other', async() => {
    const user = userEvent.setup();
    API.get.mockResolvedValueOnce({ id: 200, content: payloadTestDialogResponse });
    API.post.mockResolvedValueOnce({ success: true });

    renderWithRedux(<Service initialData={initialData} serviceType={ServiceType.order} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    const textInput = document.querySelector('input[type="text"]');
    await user.clear(textInput);
    await user.type(textInput, 'abc');
    await user.click(document.querySelector('input[type="checkbox"]'));
    await user.click(screen.getByText(__('Submit')));

    await waitFor(() => expect(API.post).toHaveBeenCalled());
    const body = API.post.mock.calls[0][1];
    expect(Object.values(body)).toContain('abc');
  });
});

describe('Service component - date helpers', () => {
  it('extractDateTime keeps the selected hour, minute and meridiem', () => {
    const time = { hour: { id: 3 }, minute: { id: 15 }, meridiem: { id: 'PM' } };
    expect(extractDateTime(new Date(2026, 0, 31), time)).toEqual({
      day: 31, month: 1, year: 2026, hour: 3, minute: 15, meridiem: 'PM',
    });
  });

  it('extractDate returns the local day, month and year without shifting the day', () => {
    expect(extractDate(new Date(2026, 0, 31))).toEqual({ day: 31, month: 1, year: 2026 });
    expect(extractDate(new Date(2026, 11, 1))).toEqual({ day: 1, month: 12, year: 2026 });
  });

  it('extractDate returns undefined parts when there is no date', () => {
    expect(extractDate(undefined)).toEqual({ day: undefined, month: undefined, year: undefined });
  });
});
