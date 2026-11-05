import {
  fireEvent, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  makeFormData, mockApi, openTab, postedBody, renderAndOpenTab, renderEditor, requestsTo,
  resetFetchMock, waitForTabs,
} from '../helpers/reportEditor';

const cbOptions = {
  users: { bob: 'Bob Smith', admin: 'Administrator' },
  tenants: { 1: 'My Company', 2: 'Acme Corp' },
  categories: { environment: 'Environment', department: 'Department' },
  tag_values: {
    environment: [['prod', 'Production'], ['dev', 'Development']],
  },
  container_providers: [['OpenShift', '10']],
  image_labels: ['version', 'release'],
  timezones: [
    ['(GMT+00:00) UTC', 'UTC'],
    ['(GMT-05:00) Eastern Time (US & Canada)', 'Eastern Time (US & Canada)'],
  ],
  cb_model: 'Vm',
};

const chargebackData = (model, options = {}) => makeFormData({
  report_type: 'chargeback',
  report: {
    model,
    col_order: ['ChargebackVm-cpu_used_metric'],
    headers: ['CPU Used Metric'],
    col_formats: [''],
    col_options: { 'ChargebackVm-cpu_used_metric': { header: 'CPU Used Metric', format: '' } },
    db_options: {
      options: {
        interval: 'daily', groupby: 'date', interval_size: 1, end_interval_offset: 1, ...options,
      },
    },
  },
});

const openChargebackFilter = async(model = 'ChargebackVm', options = {}, responses = {}) => {
  await renderAndOpenTab('Filter', {
    formData: chargebackData(model, options),
    chargebackOptions: cbOptions,
    ...responses,
  });
  await waitFor(() => expect(document.getElementById('cb_show_typ')).toBeInTheDocument());
};

const change = (id, value) => fireEvent.change(document.getElementById(id), { target: { value } });
const optionLabels = (id) => Array.from(document.getElementById(id).options).map((option) => option.textContent);
const openMultiSelect = (user, id) => user.click(within(document.getElementById(id)).getByRole('combobox'));
const optionValues = (id) => Array.from(document.getElementById(id).options).map((option) => option.value);

describe('ChargebackFilter (via ReportEditor)', () => {
  afterEach(resetFetchMock);

  describe('Show Costs by options', () => {
    it('offers owner, tag and tenant for a VM chargeback', async() => {
      await openChargebackFilter('ChargebackVm');
      expect(optionValues('cb_show_typ')).toEqual(['', 'owner', 'tag', 'tenant']);
    });

    it('offers owner, tag and the model entity for other chargeback models', async() => {
      await openChargebackFilter('ChargebackContainerProject', {}, { chargebackOptions: { ...cbOptions, cb_model: 'ContainerProject' } });
      expect(optionValues('cb_show_typ')).toEqual(['', 'entity', 'tag']);
      expect(optionLabels('cb_show_typ')).toContain('ContainerProject');
    });

    it('only offers tag for configured systems', async() => {
      await openChargebackFilter('ChargebackConfiguredSystem');
      expect(optionValues('cb_show_typ')).toEqual(['', 'tag']);
    });

    it('labels the control "Show usage by" for metering models', async() => {
      await openChargebackFilter('MeteringVm');
      expect(screen.getAllByText('Show usage by').length).toBeGreaterThan(0);
      expect(screen.queryByText('Show Costs by')).not.toBeInTheDocument();
    });
  });

  describe('owner filter', () => {
    it('lists the owners alphabetically by name', async() => {
      await openChargebackFilter('ChargebackVm', { owner: 'admin' });
      expect(optionLabels('cb_owner_id')).toEqual(['<Choose an Owner>', 'Administrator', 'Bob Smith']);
    });

    it('shows the owner select after choosing Owner', async() => {
      await openChargebackFilter();
      expect(document.getElementById('cb_owner_id')).not.toBeInTheDocument();

      change('cb_show_typ', 'owner');

      await waitFor(() => expect(document.getElementById('cb_owner_id')).toBeInTheDocument());
    });

    it('selects an owner', async() => {
      await openChargebackFilter('ChargebackVm', { owner: 'admin' });

      change('cb_owner_id', 'bob');

      await waitFor(() => expect(document.getElementById('cb_owner_id')).toHaveValue('bob'));
    });
  });

  describe('tenant filter', () => {
    it('shows the tenant select and selects a tenant', async() => {
      await openChargebackFilter();

      change('cb_show_typ', 'tenant');
      await waitFor(() => expect(document.getElementById('cb_tenant_id')).toBeInTheDocument());
      expect(optionLabels('cb_tenant_id')).toEqual(['<Choose a Tenant>', 'Acme Corp', 'My Company']);

      change('cb_tenant_id', '2');
      await waitFor(() => expect(document.getElementById('cb_tenant_id')).toHaveValue('2'));
    });
  });

  describe('tag filter', () => {
    it('shows the category select, sorted by description', async() => {
      await openChargebackFilter();

      change('cb_show_typ', 'tag');

      await waitFor(() => expect(document.getElementById('cb_tag_cat')).toBeInTheDocument());
      expect(optionLabels('cb_tag_cat')).toEqual(['<Choose a Category>', 'Department', 'Environment']);
    });

    it('does not offer tag values until a category is chosen', async() => {
      await openChargebackFilter();

      change('cb_show_typ', 'tag');
      await waitFor(() => expect(document.getElementById('cb_tag_cat')).toBeInTheDocument());

      expect(screen.queryByText('<Choose Values>')).not.toBeInTheDocument();
    });

    it('offers the values of the chosen category', async() => {
      const user = userEvent.setup();
      await openChargebackFilter();
      change('cb_show_typ', 'tag');
      await waitFor(() => expect(document.getElementById('cb_tag_cat')).toBeInTheDocument());

      change('cb_tag_cat', 'environment');

      await waitFor(() => expect(document.getElementById('cb_tag_value')).toBeInTheDocument());
      await openMultiSelect(user, 'cb_tag_value');
      expect(await screen.findByRole('option', { name: 'Production' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Development' })).toBeInTheDocument();
    });

    it('shows the tag values the report was saved with as selected', async() => {
      const user = userEvent.setup();
      await openChargebackFilter('ChargebackVm', { tag: ['environment', 'prod'] });
      await waitFor(() => expect(document.getElementById('cb_tag_value')).toBeInTheDocument());

      await openMultiSelect(user, 'cb_tag_value');

      expect(await screen.findByRole('option', { name: 'Production' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('option', { name: 'Development' })).toHaveAttribute('aria-selected', 'false');
    });

    it('keeps the saved tag values when another one is added, and posts them all', async() => {
      const user = userEvent.setup();
      mockApi({
        formData: chargebackData('ChargebackVm', { tag: ['environment', ['prod']] }),
        chargebackOptions: cbOptions,
      });
      renderEditor({ recordId: '5' });
      await waitForTabs();
      await openTab('Filter');
      await waitFor(() => expect(document.getElementById('cb_tag_value')).toBeInTheDocument());

      await openMultiSelect(user, 'cb_tag_value');
      await user.click(await screen.findByRole('option', { name: 'Development' }));
      await waitFor(() => expect(screen.getByRole('option', { name: 'Development' })).toHaveAttribute('aria-selected', 'true'));
      expect(screen.getByRole('option', { name: 'Production' })).toHaveAttribute('aria-selected', 'true');

      await user.click(screen.getAllByRole('button', { name: 'Save' })[0]);
      await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));

      expect(postedBody('/report/save/').report_data).toMatchObject({
        cb_show_typ: 'tag',
        cb_tag_cat: 'environment',
        cb_tag_value: ['prod', 'dev'],
      });
    });

    it('keeps a saved tag value that the category no longer offers', async() => {
      const user = userEvent.setup();
      mockApi({
        formData: chargebackData('ChargebackVm', { tag: ['environment', ['retired']] }),
        chargebackOptions: cbOptions,
      });
      renderEditor({ recordId: '5' });
      await waitForTabs();
      await openTab('Filter');
      await waitFor(() => expect(document.getElementById('cb_tag_value')).toBeInTheDocument());

      await openMultiSelect(user, 'cb_tag_value');
      expect(await screen.findByRole('option', { name: 'Production' })).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('option', { name: 'Development' })).toHaveAttribute('aria-selected', 'false');
      // Saving an unchanged edit form is not allowed, so touch an unrelated field first.
      change('name', 'Renamed');
      await waitFor(() => expect(screen.getAllByRole('button', { name: 'Save' })[0]).toBeEnabled());
      await user.click(screen.getAllByRole('button', { name: 'Save' })[0]);
      await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));

      expect(postedBody('/report/save/').report_data.cb_tag_value).toEqual(['retired']);
    });

    it('does not offer values for a category without any', async() => {
      await openChargebackFilter();
      change('cb_show_typ', 'tag');
      await waitFor(() => expect(document.getElementById('cb_tag_cat')).toBeInTheDocument());

      change('cb_tag_cat', 'department');

      await waitFor(() => expect(document.getElementById('cb_tag_cat')).toHaveValue('department'));
      expect(screen.queryByText('<Choose Values>')).not.toBeInTheDocument();
    });
  });

  describe('entity filter', () => {
    const openEntityFilter = (responses = {}) => openChargebackFilter(
      'ChargebackContainerProject',
      {},
      { chargebackOptions: { ...cbOptions, cb_model: 'ContainerProject' }, ...responses },
    );

    it('shows the provider select with the server providers', async() => {
      await openEntityFilter();

      change('cb_show_typ', 'entity');

      await waitFor(() => expect(document.getElementById('cb_provider_id')).toBeInTheDocument());
      expect(optionLabels('cb_provider_id')).toEqual(['<Choose Provider>', 'All Providers', 'OpenShift']);
      expect(document.getElementById('cb_entity_id')).not.toBeInTheDocument();
    });

    it('loads the entities of the chosen provider and defaults to All Entities', async() => {
      await openEntityFilter({ chargebackEntities: { entities: [['Project A', 'a'], ['Project B', 'b']] } });
      change('cb_show_typ', 'entity');
      await waitFor(() => expect(document.getElementById('cb_provider_id')).toBeInTheDocument());

      change('cb_provider_id', '10');

      await waitFor(() => expect(requestsTo('/report/chargeback_entities')).toHaveLength(1));
      const [[url]] = requestsTo('/report/chargeback_entities');
      expect(url).toContain('provider_id=10');
      expect(url).toContain('model=ChargebackContainerProject');
      await waitFor(() => expect(optionLabels('cb_entity_id')).toEqual([
        '<Choose Entity>', 'All Entities', 'Project A', 'Project B',
      ]));
      expect(document.getElementById('cb_entity_id')).toHaveValue('all');
    });

    it('selects an entity', async() => {
      await openEntityFilter({ chargebackEntities: { entities: [['Project A', 'a']] } });
      change('cb_show_typ', 'entity');
      await waitFor(() => expect(document.getElementById('cb_provider_id')).toBeInTheDocument());
      change('cb_provider_id', '10');
      await waitFor(() => expect(optionValues('cb_entity_id')).toContain('a'));

      change('cb_entity_id', 'a');

      await waitFor(() => expect(document.getElementById('cb_entity_id')).toHaveValue('a'));
    });

    it('does not request entities for All Providers', async() => {
      await openEntityFilter();
      change('cb_show_typ', 'entity');
      await waitFor(() => expect(document.getElementById('cb_provider_id')).toBeInTheDocument());

      change('cb_provider_id', 'all');

      await waitFor(() => expect(document.getElementById('cb_provider_id')).toHaveValue('all'));
      expect(requestsTo('/report/chargeback_entities')).toHaveLength(0);
      expect(document.getElementById('cb_entity_id')).not.toBeInTheDocument();
    });

    it('keeps the entity select usable when the entities request fails', async() => {
      await openEntityFilter({ chargebackEntities: { throws: new Error('Network error') } });
      change('cb_show_typ', 'entity');
      await waitFor(() => expect(document.getElementById('cb_provider_id')).toBeInTheDocument());

      change('cb_provider_id', '10');

      await waitFor(() => expect(document.getElementById('cb_entity_id')).toBeInTheDocument());
      expect(optionValues('cb_entity_id')).toEqual(['', 'all']);
    });
  });

  describe('group by', () => {
    it('offers date, tag and tenant groupings for a VM chargeback', async() => {
      await openChargebackFilter('ChargebackVm');
      expect(optionValues('cb_groupby')).toEqual(['date', 'date-first', 'date-only', 'tag', 'tenant']);
    });

    it('offers project and label groupings for container images', async() => {
      await openChargebackFilter('ChargebackContainerImage');
      expect(optionValues('cb_groupby')).toEqual(['date', 'date-first', 'date-only', 'project', 'label', 'tag']);
    });

    it('shows the tag category multiselect when grouping by tag', async() => {
      await openChargebackFilter();
      expect(screen.queryByText('Group by Tag')).not.toBeInTheDocument();

      change('cb_groupby', 'tag');

      expect(await screen.findByText('Group by Tag')).toBeInTheDocument();
    });

    it('selects categories to group by', async() => {
      const user = userEvent.setup();
      await openChargebackFilter('ChargebackVm', { groupby: 'tag' });

      await openMultiSelect(user, 'cb_groupby_tag');
      await user.click(await screen.findByRole('option', { name: 'Environment' }));

      await waitFor(() => expect(screen.getByRole('option', { name: 'Environment' })).toHaveAttribute('aria-selected', 'true'));
      expect(screen.getByRole('option', { name: 'Department' })).toHaveAttribute('aria-selected', 'false');
    });

    it('shows the image label select when grouping container images by label', async() => {
      await openChargebackFilter('ChargebackContainerImage', { groupby: 'label' });

      expect(document.getElementById('cb_groupby_label')).toBeInTheDocument();
      expect(optionLabels('cb_groupby_label')).toEqual(['<Choose a Label>', 'version', 'release']);

      change('cb_groupby_label', 'release');
      await waitFor(() => expect(document.getElementById('cb_groupby_label')).toHaveValue('release'));
    });

    it('shows a legacy "vm" grouping as the model and date option', async() => {
      await openChargebackFilter('ChargebackVm', { groupby: 'vm' });
      expect(document.getElementById('cb_groupby')).toHaveValue('date');
    });
  });

  describe('interval', () => {
    it('lists day-based choices by default', async() => {
      await openChargebackFilter();
      expect(optionLabels('cb_end_interval_offset')).toContain('Today (partial)');
      expect(optionLabels('cb_interval_size')).toContain('1 Week');
    });

    it('switches the choices and the label when the interval becomes weekly', async() => {
      await openChargebackFilter();

      change('cb_interval', 'weekly');

      await waitFor(() => expect(optionLabels('cb_end_interval_offset')).toContain('This Week (partial)'));
      expect(optionLabels('cb_interval_size')).toContain('12 Weeks');
      expect(screen.getByText('Weekly Ending with')).toBeInTheDocument();
    });

    it('switches the choices when the interval becomes monthly', async() => {
      await openChargebackFilter();

      change('cb_interval', 'monthly');

      await waitFor(() => expect(optionLabels('cb_end_interval_offset')).toContain('This Month (partial)'));
      expect(optionLabels('cb_interval_size')).toContain('12 Months');
    });

    it('stores the chosen end offset and size as numbers', async() => {
      await openChargebackFilter();

      change('cb_end_interval_offset', '3');
      change('cb_interval_size', '14');

      await waitFor(() => expect(document.getElementById('cb_end_interval_offset')).toHaveValue('3'));
      expect(document.getElementById('cb_interval_size')).toHaveValue('14');
    });

    it('selects a time zone', async() => {
      await openChargebackFilter();

      change('tz', 'UTC');

      await waitFor(() => expect(document.getElementById('tz')).toHaveValue('UTC'));
    });
  });

  describe('chargeback resources', () => {
    it('toggles the capacity and utilization metrics', async() => {
      const user = userEvent.setup();
      await openChargebackFilter();
      const toggle = document.getElementById('cb_include_metrics');
      expect(toggle).toHaveAttribute('aria-checked', 'true');

      await user.click(toggle);

      await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'false'));
    });

    it('toggles the cumulative rate calculation', async() => {
      const user = userEvent.setup();
      await openChargebackFilter();
      const toggle = document.getElementById('cumulative_rate_calculation');
      expect(toggle).toHaveAttribute('aria-checked', 'true');

      await user.click(toggle);

      await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'false'));
    });

    it('changes the method for allocated metrics', async() => {
      await openChargebackFilter();
      expect(document.getElementById('method_for_allocated_metrics')).toHaveValue('max');

      change('method_for_allocated_metrics', 'avg');

      await waitFor(() => expect(document.getElementById('method_for_allocated_metrics')).toHaveValue('avg'));
    });

    it('hides the VM-only controls for other chargeback models', async() => {
      await openChargebackFilter('ChargebackContainerProject');

      expect(document.getElementById('method_for_allocated_metrics')).not.toBeInTheDocument();
      expect(screen.queryByText('Include Capacity & Utilization Metrics')).not.toBeInTheDocument();
      expect(screen.getByText('Include Cumulative Rate Calculation')).toBeInTheDocument();
    });

    it('hides the cumulative rate calculation for metering models', async() => {
      await openChargebackFilter('MeteringVm');

      expect(screen.queryByText('Include Cumulative Rate Calculation')).not.toBeInTheDocument();
      expect(document.getElementById('method_for_allocated_metrics')).toBeInTheDocument();
    });
  });

  describe('saving', () => {
    it('posts the chargeback choices that were edited', async() => {
      const user = userEvent.setup();
      mockApi({ formData: chargebackData('ChargebackVm'), chargebackOptions: cbOptions });
      renderEditor({ recordId: '5' });
      await waitForTabs();
      await openTab('Filter');
      await waitFor(() => expect(document.getElementById('cb_show_typ')).toBeInTheDocument());

      change('cb_show_typ', 'owner');
      await waitFor(() => expect(document.getElementById('cb_owner_id')).toBeInTheDocument());
      change('cb_owner_id', 'bob');
      change('cb_interval', 'weekly');
      change('tz', 'UTC');
      await waitFor(() => expect(document.getElementById('tz')).toHaveValue('UTC'));

      await user.click(screen.getAllByRole('button', { name: 'Save' })[0]);
      await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));

      expect(postedBody('/report/save/').report_data).toMatchObject({
        cb_show_typ: 'owner',
        cb_owner_id: 'bob',
        cb_interval: 'weekly',
        tz: 'UTC',
      });
    });
  });
});
