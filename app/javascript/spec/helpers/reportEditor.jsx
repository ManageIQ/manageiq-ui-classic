/* eslint-disable import/no-extraneous-dependencies -- test-only helper, lives outside the spec globs */
import { screen, waitFor, fireEvent } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from './mountForm';
import ReportEditor from '../../components/report-editor';

// Shared fixtures and fetch-mock wiring for the report editor specs.
// Every endpoint the editor can call is mocked by default, so no request ever reaches the network;
// fetch-mock rejects any call that matches no route.

export const ROUTES = {
  formData: 'glob:*/report/form_data/*',
  availableFields: 'glob:*/report/available_fields*',
  trendLimitCols: 'glob:*/report/trend_limit_cols*',
  chargebackOptions: 'glob:*/report/chargeback_options*',
  chargebackEntities: 'glob:*/report/chargeback_entities*',
  expressionMetadata: 'glob:*/expression_editor/metadata*',
  save: 'glob:*/report/save/*',
  preview: 'glob:*/report/preview',
  previewResult: 'glob:*/report/preview_result*',
};

const METHODS = {
  formData: 'get',
  availableFields: 'get',
  trendLimitCols: 'get',
  chargebackOptions: 'get',
  chargebackEntities: 'get',
  expressionMetadata: 'get',
  save: 'post',
  preview: 'post',
  previewResult: 'get',
};

// A response that never settles, for asserting loading states.
export const PENDING = () => new Promise(() => {});

const baseFormData = {
  report: {
    name: 'My Report',
    title: 'My Title',
    model: 'Vm',
    col_order: [],
    headers: [],
    col_formats: [],
    col_options: {},
    queue_timeout: null,
    pdf_page_size: 'US-Letter',
    db_options: {},
  },
  report_type: 'standard',
  models: [['Virtual Machines', 'Vm'], ['Hosts', 'Host']],
  queue_timeout_options: [['(Use System Default)', null], ['1 Hour', 3600]],
  pdf_page_sizes: [['US Letter', 'US-Letter'], ['A4', 'A4']],
  field_metadata: {},
};

// `report` is merged one level deep so specs only list the report attributes they care about.
export const makeFormData = ({ report, ...rest } = {}) => ({
  ...baseFormData,
  report: { ...baseFormData.report, ...report },
  ...rest,
});

fetchMock.mockGlobal();

/**
 * Replaces a single mocked endpoint. `response` is anything fetch-mock accepts, e.g. a JSON object,
 * `{ throws: new Error('...') }` for a network failure, or PENDING.
 */
export const mockRoute = (name, response) => {
  fetchMock.removeRoute(name);
  const normalizedResponse = typeof response === 'function'
    ? (callLog) => {
      const url = callLog && typeof callLog === 'object' && callLog.url ? callLog.url : callLog;
      const options = callLog && typeof callLog === 'object' ? callLog.options : undefined;
      return response(url, options, callLog);
    }
    : response;
  fetchMock.route(ROUTES[name], normalizedResponse, { name, method: METHODS[name] });
};

/**
 * Mocks every endpoint of the editor. Pass any of the ROUTES keys to override its response.
 * The available-fields default mirrors the server: it carries the metadata of the form data.
 */
export const mockApi = (responses = {}) => {
  const formData = responses.formData || makeFormData();
  const defaults = {
    formData,
    availableFields: { fields: [], field_metadata: formData.field_metadata },
    trendLimitCols: { limit_cols: [] },
    chargebackOptions: {},
    chargebackEntities: { entities: [] },
    expressionMetadata: { fields: [] },
    save: { success: true, message: 'Report was saved' },
    preview: { columns: [], rows: [] },
    previewResult: { complete: true, columns: [], rows: [] },
  };
  Object.keys(ROUTES).forEach((name) => mockRoute(name, responses[name] || defaults[name]));
};

export const resetFetchMock = () => {
  fetchMock.removeRoutes();
  fetchMock.callHistory.clear();
};

export const requestsTo = (fragment) =>
  fetchMock.callHistory.calls().map((call) => call.args).filter(([url]) => url.includes(fragment));
export const requestedUrls = () =>
  fetchMock.callHistory.calls().map((call) => call.args[0]);
export const postedBody = (fragment) => JSON.parse(requestsTo(fragment)[0][1].body);

export const renderEditor = (props = {}) => renderWithRedux(<ReportEditor recordId="new" {...props} />);

export const waitForTabs = () => waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));

export const openTab = async(tabName) => {
  const tab = screen.getAllByRole('tab').find((t) => t.textContent.trim() === tabName);
  fireEvent.click(tab);
  await waitFor(() => {});
};

/** Renders the editor and switches to a tab. When `responses` is given the endpoints are (re)mocked first. */
export const renderAndOpenTab = async(tabName, responses, props) => {
  if (responses) {
    mockApi(responses);
  }
  const result = renderEditor(props);
  await waitForTabs();
  await openTab(tabName);
  return result;
};
