import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import ReportEditor from '../../components/report-editor';

const makeFormData = (overrides = {}) => ({
  report: {
    name: 'My Report',
    title: 'My Title',
    model: 'Vm',
    col_order: ['Vm-name', 'Vm-num_cpu'],
    headers: ['Name', 'CPUs'],
    col_formats: ['', ''],
    col_options: {
      'Vm-name': { header: 'Name', format: '' },
      'Vm-num_cpu': { header: 'CPUs', format: '' },
    },
    queue_timeout: null,
    db_options: {},
  },
  report_type: 'standard',
  models: [['Virtual Machines', 'Vm']],
  queue_timeout_options: [['(Use System Default)', null]],
  pdf_page_sizes: [],
  available_fields: [['Name', 'Vm-name'], ['CPUs', 'Vm-num_cpu']],
  field_metadata: {
    'Vm-name': { numeric: false, data_type: 'string' },
    'Vm-num_cpu': { numeric: true, data_type: 'integer' },
  },
  style_classes: {
    'miq-red': 'Red',
    'miq-green': 'Green',
    'miq-yellow': 'Yellow',
  },
  ...overrides,
});

const renderAndOpenStyling = async(formDataFn = makeFormData) => {
  const formData = formDataFn();
  window.http = {
    get: jest.fn((url) => {
      if (url.includes('react_available_fields')) {
        return Promise.resolve({ fields: formData.available_fields || [], field_metadata: formData.field_metadata || {} });
      }
      return Promise.resolve(formData);
    }),
    post: jest.fn(() => Promise.resolve({ success: true })),
  };
  renderWithRedux(<ReportEditor recordId="new" />);
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
  const stylingTab = screen.getAllByRole('tab').find((t) => t.textContent.trim() === 'Styling');
  fireEvent.click(stylingTab);
  await waitFor(() => {});
};

describe('StylingTab (via ReportEditor)', () => {
  afterEach(() => jest.clearAllMocks());

  it('shows "Add columns" prompt when no columns are selected', async() => {
    await renderAndOpenStyling(() => makeFormData({
      report: {
        ...makeFormData().report,
        col_order: [],
        col_options: {},
        headers: [],
        col_formats: [],
      },
      available_fields: [],
    }));
    expect(screen.getByText(/Add columns on the Columns tab to configure styling rules/)).toBeInTheDocument();
  });

  it('renders an accordion item per column', async() => {
    await renderAndOpenStyling();
    // Accordion renders column names — both appear in the DOM (also in selects)
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CPUs').length).toBeGreaterThan(0);
    // Confirm there are at least 2 accordion items (there may be more from other tabs in DOM)
    expect(document.querySelectorAll('.cds--accordion__item').length).toBeGreaterThanOrEqual(2);
  });

  it('renders the footer note about rule evaluation order', async() => {
    await renderAndOpenStyling();
    expect(screen.getByText(/Style conditions are evaluated top to bottom/)).toBeInTheDocument();
  });

  it('shows the Style select when an accordion item is expanded', async() => {
    await renderAndOpenStyling();
    // The first accordion item auto-opens only if it has rules; expand it manually
    const accordionButtons = screen.getAllByRole('button').filter(
      (btn) => btn.closest('.cds--accordion__item')
    );
    fireEvent.click(accordionButtons[0]);
    await waitFor(() => expect(document.getElementById('style-class-Vm-name-0')).toBeInTheDocument());
  });

  it('shows "If" operator and value fields after a style class is chosen', async() => {
    await renderAndOpenStyling(() => makeFormData({
      report: {
        ...makeFormData().report,
        col_options: {
          'Vm-name': { header: 'Name', format: '', style: [{ class: 'miq-red', operator: '=', value: 'foo' }] },
          'Vm-num_cpu': { header: 'CPUs', format: '' },
        },
      },
    }));
    // The accordion with a rule should auto-open (open={ruleCount > 0})
    await waitFor(() => expect(document.getElementById('style-class-Vm-name-0')).toBeInTheDocument());
    expect(document.getElementById('style-operator-Vm-name-0')).toBeInTheDocument();
  });

  it('shows rule count badge in accordion title when rules are configured', async() => {
    await renderAndOpenStyling(() => makeFormData({
      report: {
        ...makeFormData().report,
        col_options: {
          'Vm-name': { header: 'Name', format: '', style: [{ class: 'miq-red', operator: 'DEFAULT' }] },
          'Vm-num_cpu': { header: 'CPUs', format: '' },
        },
      },
    }));
    await waitFor(() => expect(screen.getByText('1 rule')).toBeInTheDocument());
  });

  it('shows boolean value select for boolean column type', async() => {
    await renderAndOpenStyling(() => makeFormData({
      report: {
        ...makeFormData().report,
        col_options: {
          'Vm-name': { header: 'Name', format: '', style: [{ class: 'miq-red', operator: '=', value: 'true' }] },
          'Vm-num_cpu': { header: 'CPUs', format: '' },
        },
      },
      field_metadata: {
        'Vm-name': { data_type: 'boolean' },
        'Vm-num_cpu': { numeric: true, data_type: 'integer' },
      },
    }));
    await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toBeInTheDocument());
    const valueEl = document.getElementById('style-value-Vm-name-0');
    expect(valueEl.tagName.toLowerCase()).toBe('select');
    expect(valueEl.querySelector('option[value="true"]')).toBeInTheDocument();
    expect(valueEl.querySelector('option[value="false"]')).toBeInTheDocument();
  });
});
