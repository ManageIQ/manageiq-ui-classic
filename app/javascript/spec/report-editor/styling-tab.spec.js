import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  makeFormData as makeBaseFormData, renderAndOpenTab, resetFetchMock,
} from '../helpers/reportEditor';

const availableFields = [['Name', 'Vm-name'], ['CPUs', 'Vm-num_cpu']];

const makeFormData = ({ report, ...rest } = {}) => makeBaseFormData({
  report: {
    col_order: ['Vm-name', 'Vm-num_cpu'],
    headers: ['Name', 'CPUs'],
    col_formats: ['', ''],
    col_options: {
      'Vm-name': { header: 'Name', format: '' },
      'Vm-num_cpu': { header: 'CPUs', format: '' },
    },
    ...report,
  },
  models: [['Virtual Machines', 'Vm']],
  field_metadata: {
    'Vm-name': { numeric: false, data_type: 'string' },
    'Vm-num_cpu': { numeric: true, data_type: 'integer' },
  },
  style_classes: {
    'miq-red': 'Red',
    'miq-green': 'Green',
    'miq-yellow': 'Yellow',
  },
  ...rest,
});

const openStyling = (formData = makeFormData()) => renderAndOpenTab('Styling', {
  formData,
  availableFields: { fields: availableFields, field_metadata: formData.field_metadata },
});

describe('StylingTab (via ReportEditor)', () => {
  // The global jest mock of n__ always returns the singular form
  const originalNgettext = window.n__;
  beforeAll(() => {
    window.n__ = (singular, plural, count) => (count === 1 ? singular : plural);
  });
  afterAll(() => {
    window.n__ = originalNgettext;
  });

  afterEach(resetFetchMock);

  it('shows "Add columns" prompt when no columns are selected', async() => {
    await openStyling(makeFormData({
      report: {
        ...makeFormData().report,
        col_order: [],
        col_options: {},
        headers: [],
        col_formats: [],
      },
    }));
    expect(screen.getByText(/Add columns on the Columns tab to configure styling rules/)).toBeInTheDocument();
  });

  it('renders an accordion item per column', async() => {
    await openStyling();
    // Accordion renders column names — both appear in the DOM (also in selects)
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CPUs').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CPUs' })).toBeInTheDocument();
  });

  it('renders the footer note about rule evaluation order', async() => {
    await openStyling();
    expect(screen.getByText(/Style conditions are evaluated top to bottom/)).toBeInTheDocument();
  });

  it('shows the Style select when an accordion item is expanded', async() => {
    await openStyling();
    // The first accordion item auto-opens only if it has rules; expand it manually
    const accordionButtons = screen.getAllByRole('button').filter(
      (btn) => btn.closest('.cds--accordion__item')
    );
    fireEvent.click(accordionButtons[0]);
    await waitFor(() => expect(document.getElementById('style-class-Vm-name-0')).toBeInTheDocument());
  });

  it('shows "If" operator and value fields after a style class is chosen', async() => {
    await openStyling(makeFormData({
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
    await openStyling(makeFormData({
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
    await openStyling(makeFormData({
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
    expect(Array.from(valueEl.options).map((option) => option.value)).toEqual(['true', 'false']);
  });

  describe('editing rules', () => {
    const nameRule = (rule, meta = {}) => makeFormData({
      report: {
        ...makeFormData().report,
        col_options: {
          'Vm-name': { header: 'Name', format: '', style: rule ? [rule] : [] },
          'Vm-num_cpu': { header: 'CPUs', format: '' },
        },
      },
      field_metadata: {
        'Vm-name': { data_type: 'string', ...meta },
        'Vm-num_cpu': { numeric: true, data_type: 'integer' },
      },
    });

    const expand = async(columnName) => {
      fireEvent.click(screen.getByRole('button', { name: columnName }));
      await waitFor(() => expect(screen.getByRole('button', { name: columnName })).toHaveAttribute('aria-expanded', 'true'));
    };

    const change = (id, value) => fireEvent.change(document.getElementById(id), { target: { value } });

    it('creates a rule with the DEFAULT operator when a style is first chosen', async() => {
      await openStyling();
      await expand('Name');

      change('style-class-Vm-name-0', 'miq-red');

      await waitFor(() => expect(document.getElementById('style-operator-Vm-name-0')).toHaveValue('DEFAULT'));
      expect(screen.getByText('1 rule')).toBeInTheDocument();
      expect(document.getElementById('style-value-Vm-name-0')).not.toBeInTheDocument();
    });

    it('offers a second rule only once the first has a style', async() => {
      await openStyling(nameRule(null));
      await expand('Name');
      expect(document.getElementById('style-class-Vm-name-1')).not.toBeInTheDocument();

      change('style-class-Vm-name-0', 'miq-red');

      await waitFor(() => expect(document.getElementById('style-class-Vm-name-1')).toBeInTheDocument());
      expect(screen.getByText('Rule 2')).toBeInTheDocument();
    });

    it('removes the rule and its fields when the style is set back to Normal', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: '=', value: 'foo' }));
      await waitFor(() => expect(document.getElementById('style-class-Vm-name-0')).toHaveValue('miq-red'));

      change('style-class-Vm-name-0', '');

      await waitFor(() => expect(document.getElementById('style-operator-Vm-name-0')).not.toBeInTheDocument());
      expect(screen.queryByText('1 rule')).not.toBeInTheDocument();
    });

    it('changes the style of an existing rule without losing its condition', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: '=', value: 'foo' }));
      await waitFor(() => expect(document.getElementById('style-class-Vm-name-0')).toHaveValue('miq-red'));

      change('style-class-Vm-name-0', 'miq-green');

      await waitFor(() => expect(document.getElementById('style-class-Vm-name-0')).toHaveValue('miq-green'));
      expect(document.getElementById('style-operator-Vm-name-0')).toHaveValue('=');
      expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('foo');
    });

    it('lets a comparison value be typed for a text column', async() => {
      const user = userEvent.setup();
      await openStyling(nameRule({ class: 'miq-red', operator: '=', value: '' }));
      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toBeInTheDocument());

      await user.type(document.getElementById('style-value-Vm-name-0'), 'prod');

      expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('prod');
    });

    it('hides the value input for the DEFAULT operator', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: '=', value: 'foo' }));
      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toBeInTheDocument());

      change('style-operator-Vm-name-0', 'DEFAULT');

      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).not.toBeInTheDocument());
    });

    it('hides the value input for the null operators', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: '=', value: 'foo' }));
      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toBeInTheDocument());

      change('style-operator-Vm-name-0', 'IS NULL');

      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).not.toBeInTheDocument());
    });

    it.each([
      ['DEFAULT'],
      ['IS NULL'],
      ['IS NOT NULL'],
    ])('renders no value input for a saved %s rule', async(operator) => {
      await openStyling(nameRule({ class: 'miq-red', operator }));
      await waitFor(() => expect(document.getElementById('style-operator-Vm-name-0')).toHaveValue(operator));

      expect(document.getElementById('style-value-Vm-name-0')).not.toBeInTheDocument();
    });

    it('shows the saved value of a date rule', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: '>', value: 'Last 7 Days' }, { data_type: 'datetime' }));

      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('Last 7 Days'));
    });

    it('starts a date rule without a value on Today', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: '>' }, { data_type: 'date' }));

      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('Today'));
    });

    it('lets the value of a date rule be changed', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: '>', value: 'Today' }, { data_type: 'datetime' }));
      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('Today'));

      change('style-value-Vm-name-0', 'This Month');

      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('This Month'));
    });

    it('treats a column with a date format as a date column', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: '>', value: 'Yesterday' }, { data_type: 'string', format_sub_type: 'datetime' }));

      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('Yesterday'));
      expect(Array.from(document.getElementById('style-value-Vm-name-0').options)).toHaveLength(9);
    });

    it('defaults the value to true when the operator changes on a boolean column', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: 'DEFAULT' }, { data_type: 'boolean' }));
      await waitFor(() => expect(document.getElementById('style-operator-Vm-name-0')).toBeInTheDocument());

      change('style-operator-Vm-name-0', '=');

      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('true'));
    });

    it('defaults the value to Today when the operator changes on a date column', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: 'DEFAULT' }, { data_type: 'datetime' }));
      await waitFor(() => expect(document.getElementById('style-operator-Vm-name-0')).toBeInTheDocument());

      change('style-operator-Vm-name-0', '>');

      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('Today'));
      expect(Array.from(document.getElementById('style-value-Vm-name-0').options)).toHaveLength(9);
    });

    it('defaults the value to blank when the operator changes on a text column', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: 'DEFAULT' }));
      await waitFor(() => expect(document.getElementById('style-operator-Vm-name-0')).toBeInTheDocument());

      change('style-operator-Vm-name-0', '=');

      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toHaveValue(''));
    });

    it('lets the value of a boolean rule be switched to false', async() => {
      await openStyling(nameRule({ class: 'miq-red', operator: '=', value: 'true' }, { data_type: 'boolean' }));
      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('true'));

      change('style-value-Vm-name-0', 'false');

      await waitFor(() => expect(document.getElementById('style-value-Vm-name-0')).toHaveValue('false'));
    });

    it('shows a unit select next to the value for columns with units', async() => {
      await openStyling(nameRule(
        { class: 'miq-red', operator: '>', value: '10' },
        { units: [['Bytes', 'bytes'], ['Megabytes', 'megabytes']] },
      ));
      await waitFor(() => expect(document.getElementById('style-suffix-Vm-name-0')).toHaveValue('bytes'));

      change('style-suffix-Vm-name-0', 'megabytes');

      await waitFor(() => expect(document.getElementById('style-suffix-Vm-name-0')).toHaveValue('megabytes'));
    });

    it('pluralises the rule count in the accordion title', async() => {
      await openStyling(makeFormData({
        report: {
          ...makeFormData().report,
          col_options: {
            'Vm-name': {
              header: 'Name',
              format: '',
              style: [{ class: 'miq-red', operator: 'DEFAULT' }, { class: 'miq-green', operator: '=', value: 'x' }],
            },
            'Vm-num_cpu': { header: 'CPUs', format: '' },
          },
        },
      }));

      await waitFor(() => expect(screen.getByText('2 rules')).toBeInTheDocument());
    });
  });
});
