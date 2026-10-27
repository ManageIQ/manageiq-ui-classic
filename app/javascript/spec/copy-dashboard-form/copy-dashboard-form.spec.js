import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import CopyDashboardForm from '../../components/copy-dashboard-form/copy-dashboard-form';
import { renderWithRedux } from '../helpers/mountForm';
import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';
import * as handleFailure from '../../helpers/handle-failure';

describe('Copy Dashboard form', () => {
  beforeAll(() => fetchMock.mockGlobal());

  const initialProps = { dashboardId: '55' };
  const baseUrl = `/report/dashboard_get/${initialProps.dashboardId}`;
  const apiUrl = '/api/groups?expand=resources';
  const dashboardData = {
    name: 'Clint',
    description: 'good dashboard',
    owner_id: '12',
  };
  const apiData = {
    resources: [
      { description: 'name1', id: '1' },
      { description: '80s', id: '80s' },
      { description: 'current group', id: '12' },
    ],
  };

  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.removeRoutes();
    fetchMock.callHistory.clear();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyMiqAjaxButton.mockRestore();
  });

  it('should render correctly and set initialValue', async() => {
    fetchMock
      .get(baseUrl, dashboardData)
      .get(apiUrl, apiData)
      .get('/report/dashboard_get/55?name=Clint', { length: 1 });

    renderWithRedux(<CopyDashboardForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Name')).toHaveValue('Clint');
    expect(screen.getByLabelText('Description')).toHaveValue('good dashboard');
    expect(submitSpyMiqSparkleOn).toHaveBeenCalledTimes(1);
    expect(submitSpyMiqSparkleOff).toHaveBeenCalledTimes(1);
  });

  it('should handle error', async() => {
    /* eslint-disable no-console */
    const original = console.error;
    console.error = jest.fn();
    /* eslint-enable no-console */

    fetchMock
      .get(baseUrl, dashboardData)
      .get(apiUrl, { body: {}, status: 400 })
      .get('/report/dashboard_get/55?name=Clint', { length: 1 });

    jest.spyOn(handleFailure, 'default').mockImplementation(() => {});

    renderWithRedux(<CopyDashboardForm {...initialProps} />);
    await waitFor(() => {
      expect(handleFailure.default).toHaveBeenCalled();
    });
    /* eslint-disable no-console */
    expect(console.error).toHaveBeenCalled();
    console.error = original;
    /* eslint-enable no-console */
  });

  it('should handle cancel', async() => {
    const user = userEvent.setup();
    fetchMock
      .get(baseUrl, dashboardData)
      .get(apiUrl, apiData)
      .get('/report/dashboard_get/55?name=Clint', { length: 1 });

    renderWithRedux(<CopyDashboardForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(submitSpyMiqSparkleOn).toHaveBeenCalledTimes(2);
    });
    expect(spyMiqAjaxButton).toHaveBeenCalledWith(
      '/report/db_copy/55?button=cancel'
    );
  });

  it('should handle submit', async() => {
    const user = userEvent.setup();
    fetchMock
      .get(baseUrl, dashboardData)
      .get(apiUrl, apiData)
      .post('/report/db_copy/55?button=save', { name: 'original_name' })
      .get('/report/dashboard_get/55?name=Clint', { length: 0 })
      .get('/report/dashboard_get/55?name=new_name', { length: 0 });

    const { container } = renderWithRedux(
      <CopyDashboardForm {...initialProps} />
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });
    expect(fetchMock.callHistory.calls()).toHaveLength(2);

    const nameInput = screen.getByLabelText('Name');
    const groupInput = screen.getByRole('combobox', { name: 'Select Group' });
    await user.clear(nameInput);
    await user.type(nameInput, 'new_name');
    await user.click(groupInput);
    await user.clear(groupInput);
    await user.type(groupInput, '80s');

    let submitButton;
    await waitFor(() => {
      submitButton = container.querySelector('button.cds--btn--primary');
      expect(submitButton).not.toBeDisabled();
    });
    await user.click(submitButton);
    await waitFor(() => {
      expect(fetchMock.callHistory.called('/report/db_copy/55?button=save')).toBe(true);
    });
    await waitFor(() => {
      expect(spyMiqAjaxButton).toHaveBeenCalledWith(
        '/report/dashboard_render',
        {
          group: 'current group',
          name: 'new_name',
          original_name: 'original_name',
        }
      );
    });
    expect(fetchMock.callHistory.calls()).toHaveLength(4);
  });
});
