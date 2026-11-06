import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import ActionForm from '../../components/action-form/index';
import { renderWithRedux } from '../helpers/mountForm';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import '../helpers/miqSparkle';

describe('Action Form Component', () => {
  const sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
  const sparkleOffSpy = jest.spyOn(window, 'miqSparkleOff');

  const actionsOptionsResponse = {
    data: {
      action_types: {
        create_snapshot: 'Create a Snapshot',
        email: 'Send an E-mail',
        snmp_trap: 'Send an SNMP Trap',
        tag: 'Tag',
        reconfigure_memory: 'Reconfigure Memory',
        reconfigure_cpus: 'Reconfigure CPUs',
        custom_automation: 'Invoke a Custom Automation',
        evaluate_alerts: 'Evaluate Alerts',
        assign_scan_profile: 'Assign Profile to Analysis Task',
        set_custom_attribute: 'Set a Custom Attribute in vCenter',
        inherit_parent_tags: 'Inherit Parent Tags',
        remove_tags: 'Remove Tags',
        delete_snapshots_by_age: 'Delete Snapshots by Age',
        run_ansible_playbook: 'Run Ansible Playbook',
      },
      snmp_trap: [
        'Null',
        'Integer',
        'Unsigned32',
        'OctetString',
        'ObjectId',
        'ObjectName',
        'IpAddress',
        'Counter32',
        'Counter64',
        'Gauge32',
        'TimeTicks',
      ],
    },
  };

  // the select lists the action types as [id, label] pairs sorted by label, after the <Choose> option
  const expectedActionTypes = [
    ['', '<Choose>'],
    ...Object.entries(actionsOptionsResponse.data.action_types).sort(
      ([, a], [, b]) => (a < b ? -1 : 1)
    ),
  ];

  const optionPairs = (select) =>
    Array.from(select.querySelectorAll('option')).map((option) => [
      option.value,
      option.textContent,
    ]);

  beforeAll(() => fetchMock.mockGlobal());

  const initialProps = {
    inheritTags: [
      ['prov_max_cpu', 'Auto Approve - Max CPU'],
      ['prov_max_memory', 'Auto Approve - Max Memory'],
    ],
    availableAlerts: [
      [
        'CPU Ready > 4000 ms for more than 10 min',
        'd59185a4-40bc-11de-bd12-005056a170fa',
      ],
      ['Cluster DRS not enabled', 'eb88f942-c23e-11de-a3be-000c290de4f9'],
    ],
    tags: {
      'Auto Approve - Max CPU': [
        ['1', 86, { 'data-tokens': 'Auto Approve - Max CPU' }],
        ['2', 87, { 'data-tokens': 'Auto Approve - Max CPU' }],
        ['3', 88, { 'data-tokens': 'Auto Approve - Max CPU' }],
        ['4', 89, { 'data-tokens': 'Auto Approve - Max CPU' }],
        ['5', 90, { 'data-tokens': 'Auto Approve - Max CPU' }],
      ],
    },
    ansibleInventory: [
      ['Blue Demo Raw', 55],
      ['CF create user', 78],
    ],
    snapshotAge: [
      ['1 Hour', 3600],
      ['2 Hours', 7200],
      ['3 Hours', 10800],
    ],
    parentType: [
      ['Cluster', 'ems_cluster'],
      ['Datastore', 'storage'],
    ],
    inventoryType: 'localhost',
  };

  beforeEach(() => {
    fetchMock.route(
      { method: 'OPTIONS', url: 'http://localhost/api/actions' },
      actionsOptionsResponse
    );
  });

  afterEach(() => {
    fetchMock.removeRoutes();
    fetchMock.callHistory.clear();
    miqRedirectBack.mockClear();
    sparkleOnSpy.mockClear();
    sparkleOffSpy.mockClear();
  });

  const renderForm = async() => {
    const user = userEvent.setup();
    const view = renderWithRedux(<ActionForm {...initialProps} />);
    await waitFor(() => {
      expect(view.container.querySelector('form')).toBeInTheDocument();
    });
    // wait until the action type options were loaded from the OPTIONS call
    await waitFor(() => {
      expect(
        view.container.querySelectorAll('#action_type option').length
      ).toBeGreaterThan(1);
    });
    return { user, ...view };
  };

  const selectActionType = async(user, value) => {
    await user.selectOptions(document.querySelector('#action_type'), value);
  };

  describe('create mode', () => {
    it('should render correctly', async() => {
      const { container } = await renderForm();

      expect(container).toMatchSnapshot();
    });

    it('should load the action type options from the OPTIONS call', async() => {
      await renderForm();

      expect(
        fetchMock.callHistory.called('http://localhost/api/actions', {
          method: 'OPTIONS',
        })
      ).toBe(true);
      expect(optionPairs(document.querySelector('#action_type'))).toEqual(
        expectedActionTypes
      );
    });

    it('should select the <Choose> option by default', async() => {
      await renderForm();

      expect(document.querySelector('#action_type')).toHaveValue('');
    });

    it('should mark description and action type as required', async() => {
      const { container } = await renderForm();

      ['description', 'action_type'].forEach((name) => {
        const label = container.querySelector(`label[for="${name}"]`);
        expect(
          label.querySelector('[class*="is-required"]')
        ).toBeInTheDocument();
      });
    });

    it('should limit the description to 50 characters', async() => {
      await renderForm();

      expect(document.querySelector('#description')).toHaveAttribute(
        'maxlength',
        '50'
      );
    });

    it('should render the Add and Cancel buttons and no Reset button', async() => {
      await renderForm();

      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Reset' })
      ).not.toBeInTheDocument();
    });

    it('should disable the Add button until the form is valid', async() => {
      const { user } = await renderForm();

      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();

      await user.type(document.querySelector('#description'), 'My action');
      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();

      await selectActionType(user, 'create_snapshot');
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
      });
    });

    it('should not render any action type specific sub form initially', async() => {
      await renderForm();

      [
        'Analysis Profiles',
        'Snapshot Settings',
        'Snapshot Age Settings',
        'Select Alerts to be Evaluated',
        'Inherit Tags Settings',
        'Custom Automation',
        'Reconfigure CPUs',
        'Reconfigure Memory',
        'Remove Tags Settings',
        'Run an Ansible Playbook',
        'E-mail Settings',
        'SNMP Trap Settings',
        'Custom Attribute Settings',
        'Applied Tag',
      ].forEach((title) => {
        expect(
          screen.queryByRole('heading', { name: title })
        ).not.toBeInTheDocument();
      });
    });

    it('should call miqRedirectBack with a warning when canceled', async() => {
      const { user } = await renderForm();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(miqRedirectBack).toHaveBeenCalledWith(
        'Creation of new Action was canceled by the user.',
        'warning',
        '/miq_action/show_list'
      );
    });
  });

  describe('conditional sub forms', () => {
    it('should render the analysis profiles for assign_scan_profile', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'assign_scan_profile');

      expect(
        await screen.findByText('Analysis Profiles', {
          selector: 'h3, h4, legend, span, p',
        })
      ).toBeInTheDocument();
      const select = document.querySelector(
        '[name="options.scan_item_set_name"]'
      );
      expect(optionPairs(select).map(([, label]) => label)).toEqual(
        expect.arrayContaining([
          'Copy of sample',
          'default',
          'host default',
          'host sample',
          'sample',
        ])
      );
    });

    it('should render the snapshot name for create_snapshot', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'create_snapshot');

      expect(await screen.findByText('Snapshot Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Snapshot Name')).toBeInTheDocument();
    });

    it('should render the snapshot age options for delete_snapshots_by_age', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'delete_snapshots_by_age');

      expect(
        await screen.findByText('Snapshot Age Settings')
      ).toBeInTheDocument();
      const select = screen.getByLabelText('Delete if Older than');
      expect(optionPairs(select)).toEqual(
        expect.arrayContaining([
          ['3600', '1 Hour'],
          ['7200', '2 Hours'],
          ['10800', '3 Hours'],
        ])
      );
    });

    it('should render the alert dual list for evaluate_alerts', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'evaluate_alerts');

      expect(
        await screen.findByText('Select Alerts to be Evaluated')
      ).toBeInTheDocument();
      expect(screen.getByText('Available Alerts:')).toBeInTheDocument();
      expect(screen.getByText('Selected Alerts:')).toBeInTheDocument();
      expect(
        screen.getByText('CPU Ready > 4000 ms for more than 10 min')
      ).toBeInTheDocument();
      expect(screen.getByText('Cluster DRS not enabled')).toBeInTheDocument();
    });

    it('should render the parent type options without the first item for inherit_parent_tags', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'inherit_parent_tags');

      expect(
        await screen.findByText('Inherit Tags Settings')
      ).toBeInTheDocument();
      const select = screen.getByLabelText('Parent Type');
      const options = optionPairs(select);
      expect(options).toContainEqual(['storage', 'Datastore']);
      expect(options).not.toContainEqual(['ems_cluster', 'Cluster']);
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('should render message, request and attribute/value pairs for custom_automation', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'custom_automation');

      expect(await screen.findByText('Custom Automation')).toBeInTheDocument();
      expect(screen.getByText('Attribute/Value Pairs')).toBeInTheDocument();
      expect(screen.getByLabelText('Message:')).toBeInTheDocument();
      expect(screen.getByLabelText('Request:')).toBeInTheDocument();
    });

    it('should render the cpu options for reconfigure_cpus', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'reconfigure_cpus');

      expect(
        await screen.findByText('Reconfigure CPUs', {
          selector: 'h3, h4, legend, span, p',
        })
      ).toBeInTheDocument();
      const select = screen.getByLabelText("Number of CPU's");
      expect(optionPairs(select)).toEqual(
        expect.arrayContaining([
          ['1', '1'],
          ['2', '2'],
          ['4', '4'],
        ])
      );
      expect(select).toHaveValue('1');
    });

    it('should render the memory size input for reconfigure_memory', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'reconfigure_memory');

      expect(
        await screen.findByText('Reconfigure Memory', {
          selector: 'h3, h4, legend, span, p',
        })
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Memory Size')).toHaveAttribute(
        'placeholder',
        '(Enter the value between 4 - 65636 MB)'
      );
    });

    it('should render the categories for remove_tags', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'remove_tags');

      expect(
        await screen.findByText('Remove Tags Settings')
      ).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('should render the playbook catalog items and inventory radios for run_ansible_playbook', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'run_ansible_playbook');

      expect(
        await screen.findByText('Run an Ansible Playbook')
      ).toBeInTheDocument();
      const select = screen.getByLabelText('Playbook Catalog Item');
      expect(optionPairs(select)).toEqual(
        expect.arrayContaining([
          ['Blue Demo Raw', 'Blue Demo Raw'],
          ['CF create user', 'CF create user'],
        ])
      );
      expect(screen.getByLabelText('LocalHost')).toBeChecked();
      expect(screen.getByLabelText('Target Machine')).not.toBeChecked();
      expect(screen.getByLabelText('Specific Hosts')).not.toBeChecked();
      expect(
        screen.queryByPlaceholderText(
          'Enter a comma separated list of IP or DNS names'
        )
      ).not.toBeInTheDocument();
    });

    it('should show the hosts input when Specific Hosts is selected', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'run_ansible_playbook');

      await user.click(await screen.findByLabelText('Specific Hosts'));

      expect(
        await screen.findByPlaceholderText(
          'Enter a comma separated list of IP or DNS names'
        )
      ).toBeInTheDocument();
    });

    it('should hide the hosts input again when another inventory is selected', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'run_ansible_playbook');

      await user.click(await screen.findByLabelText('Specific Hosts'));
      await screen.findByPlaceholderText(
        'Enter a comma separated list of IP or DNS names'
      );
      await user.click(screen.getByLabelText('Target Machine'));

      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText(
            'Enter a comma separated list of IP or DNS names'
          )
        ).not.toBeInTheDocument();
      });
    });

    it('should render the e-mail fields for email', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'email');

      expect(await screen.findByText('E-mail Settings')).toBeInTheDocument();
      expect(
        screen.getByLabelText('From E-mail Address (leave blank for default)')
      ).toHaveAttribute('placeholder', '(Default: cfadmin@cfserver.com)');
      expect(screen.getByLabelText('To E-mail Address')).toBeInTheDocument();
    });

    it('should render the snmp fields for snmp_trap', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'snmp_trap');

      expect(await screen.findByText('SNMP Trap Settings')).toBeInTheDocument();
      expect(screen.getByText('Variables')).toBeInTheDocument();
      expect(screen.getByLabelText('Host')).toBeInTheDocument();
      expect(screen.getByLabelText('Trap Number')).toBeInTheDocument();

      const version = screen.getByLabelText('Version');
      expect(optionPairs(version).map(([, label]) => label)).toEqual(
        expect.arrayContaining(['v1', 'v2'])
      );
      expect(version).toHaveValue('v1');
    });

    it('should add an snmp variable row with the variable types from the API response', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'snmp_trap');

      await screen.findByLabelText('Trap Number');
      expect(document.querySelector('select[name$=".var_type"]')).toBeNull();

      const addButton = screen
        .getAllByRole('button', { name: 'Add' })
        .find((button) => button.type === 'button');
      await user.click(addButton);

      await waitFor(() =>
        expect(
          document.querySelector('select[name$=".var_type"]')
        ).toBeInTheDocument());
      const type = document.querySelector('select[name$=".var_type"]');
      expect(optionPairs(type).map(([, label]) => label)).toEqual(
        expect.arrayContaining(actionsOptionsResponse.data.snmp_trap)
      );
      expect(type).toHaveValue('Counter32');
      expect(document.querySelector('input[name$=".oid"]')).toBeInTheDocument();
      expect(
        document.querySelector('input[name$=".value"]')
      ).toBeInTheDocument();
    });

    it('should render the custom attribute fields for set_custom_attribute', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'set_custom_attribute');

      expect(
        await screen.findByText('Custom Attribute Settings')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Attribute Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Value to Set')).toBeInTheDocument();
    });

    it('should render the tags grouped by category for tag', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'tag');

      expect(await screen.findByText('Applied Tag')).toBeInTheDocument();
      const select = screen.getByLabelText(/Tag to Apply/);
      const group = select.querySelector('optgroup');
      expect(group).toHaveAttribute('label', 'AUTO APPROVE - MAX CPU');
      expect(optionPairs(group)).toEqual([
        ['prov_max_cpu/1', '1'],
        ['prov_max_cpu/2', '2'],
        ['prov_max_cpu/3', '3'],
        ['prov_max_cpu/4', '4'],
        ['prov_max_cpu/5', '5'],
      ]);
    });

    it('should replace the sub form when the action type changes', async() => {
      const { user } = await renderForm();
      await selectActionType(user, 'create_snapshot');
      expect(await screen.findByText('Snapshot Settings')).toBeInTheDocument();

      await selectActionType(user, 'email');

      expect(await screen.findByText('E-mail Settings')).toBeInTheDocument();
      expect(screen.queryByText('Snapshot Settings')).not.toBeInTheDocument();
    });
  });

  describe('submit in create mode', () => {
    const fillBasics = async(user, actionType) => {
      await user.type(document.querySelector('#description'), 'My action');
      await selectActionType(user, actionType);
    };

    // Some sub forms (e.g. ae_hash) render their own 'Add' button, so pick the submit one.
    const submitButton = () =>
      screen
        .getAllByRole('button', { name: 'Add' })
        .find((button) => button.type === 'submit');

    const submitAndGetBody = async(user) => {
      await waitFor(() => expect(submitButton()).toBeEnabled());
      await user.click(submitButton());
      await waitFor(() => expect(miqRedirectBack).toHaveBeenCalled());
      const [call] = fetchMock.callHistory.calls(
        'http://localhost/api/actions',
        { method: 'POST' }
      );
      return JSON.parse(call.options.body);
    };

    beforeEach(() => {
      fetchMock.post('http://localhost/api/actions', {}, { name: 'create-success' });
    });

    it('should post a create_snapshot action and redirect', async() => {
      const { user } = await renderForm();
      await fillBasics(user, 'create_snapshot');
      await user.type(screen.getByLabelText('Snapshot Name'), 'snap1');

      const body = await submitAndGetBody(user);

      expect(body).toEqual({
        name: 'My action',
        description: 'My action',
        action_type: 'create_snapshot',
        options: { name: 'snap1' },
      });
      expect(sparkleOnSpy).toHaveBeenCalled();
      expect(miqRedirectBack).toHaveBeenCalledWith(
        'Add of action "My action" has been successfully queued.',
        'success',
        '/miq_action/show_list'
      );
    });

    it('should post the age as an integer for delete_snapshots_by_age', async() => {
      const { user } = await renderForm();
      await fillBasics(user, 'delete_snapshots_by_age');
      await user.selectOptions(
        screen.getByLabelText('Delete if Older than'),
        '7200'
      );

      const body = await submitAndGetBody(user);

      expect(body).toEqual({
        name: 'My action',
        description: 'My action',
        action_type: 'delete_snapshots_by_age',
        options: { age: 7200 },
      });
    });

    it('should post the tag prefixed with /managed/ for tag', async() => {
      const { user } = await renderForm();
      await fillBasics(user, 'tag');
      await user.selectOptions(
        screen.getByLabelText(/Tag to Apply/),
        'prov_max_cpu/2'
      );

      const body = await submitAndGetBody(user);

      expect(body).toEqual({
        name: 'My action',
        description: 'My action',
        action_type: 'tag',
        options: { tags: ['/managed/prov_max_cpu/2'] },
      });
    });

    it('should post the email options for email', async() => {
      const { user } = await renderForm();
      await fillBasics(user, 'email');
      await user.type(
        screen.getByLabelText('To E-mail Address'),
        'a@example.com'
      );

      const body = await submitAndGetBody(user);

      expect(body.action_type).toBe('email');
      expect(body.options).toEqual({ to: 'a@example.com' });
    });

    it('should use localhost for run_ansible_playbook with LocalHost', async() => {
      const { user } = await renderForm();
      await fillBasics(user, 'run_ansible_playbook');
      await user.selectOptions(
        screen.getByLabelText('Playbook Catalog Item'),
        'CF create user'
      );

      const body = await submitAndGetBody(user);

      expect(body.options).toEqual({
        service_template_name: ['CF create user'],
        use_localhost: true,
      });
    });

    it('should use the event target for run_ansible_playbook with Target Machine', async() => {
      const { user } = await renderForm();
      await fillBasics(user, 'run_ansible_playbook');
      await user.selectOptions(
        screen.getByLabelText('Playbook Catalog Item'),
        'CF create user'
      );
      await user.click(screen.getByLabelText('Target Machine'));

      const body = await submitAndGetBody(user);

      expect(body.options).toEqual({
        service_template_name: ['CF create user'],
        use_event_target: true,
      });
    });

    it('should post the hosts for run_ansible_playbook with Specific Hosts', async() => {
      const { user } = await renderForm();
      await fillBasics(user, 'run_ansible_playbook');
      await user.selectOptions(
        screen.getByLabelText('Playbook Catalog Item'),
        'Blue Demo Raw'
      );
      await user.click(screen.getByLabelText('Specific Hosts'));
      await user.type(
        await screen.findByPlaceholderText(
          'Enter a comma separated list of IP or DNS names'
        ),
        '10.0.0.1,10.0.0.2'
      );

      const body = await submitAndGetBody(user);

      expect(body.options).toEqual({
        service_template_name: ['Blue Demo Raw'],
        hosts: '10.0.0.1,10.0.0.2',
      });
    });

    it('should not call redirect and should stop the sparkle when the request fails', async() => {
      // The first matching route wins, so drop the success POST route registered
      // in beforeEach before adding the failing one.
      fetchMock.removeRoute('create-success');
      fetchMock.post('http://localhost/api/actions', 500);
      const { user } = await renderForm();
      await fillBasics(user, 'create_snapshot');
      await user.type(screen.getByLabelText('Snapshot Name'), 'snap1');
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled());

      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => expect(sparkleOffSpy).toHaveBeenCalled());
      expect(miqRedirectBack).not.toHaveBeenCalled();
    });

    it('should post the ae_hash as an object for custom_automation', async() => {
      const { user } = await renderForm();
      await fillBasics(user, 'custom_automation');
      await user.type(await screen.findByLabelText('Message:'), 'msg');
      await user.type(screen.getByLabelText('Request:'), 'req');
      // The submit button is also named 'Add', so pick the plain button.
      await user.click(
        screen
          .getAllByRole('button', { name: 'Add' })
          .find((button) => button.type === 'button')
      );
      await user.type(
        await waitFor(() => {
          const input = document.querySelector('input[name$=".attribute"]');
          expect(input).toBeInTheDocument();
          return input;
        }),
        'attr'
      );
      await user.type(document.querySelector('input[name$=".value"]'), 'val');

      const body = await submitAndGetBody(user);

      expect(body).toEqual({
        name: 'My action',
        description: 'My action',
        action_type: 'custom_automation',
        options: {
          ae_message: 'msg',
          ae_request: 'req',
          ae_hash: { attr: 'val' },
        },
      });
    });

    it('should post the parent type and category values for inherit_parent_tags', async() => {
      const { user } = await renderForm();
      await fillBasics(user, 'inherit_parent_tags');
      await user.selectOptions(
        await screen.findByLabelText('Parent Type'),
        'storage'
      );
      await user.click(screen.getByRole('combobox', { name: /Categories/ }));
      await user.click(await screen.findByText('Auto Approve - Max CPU'));

      const body = await submitAndGetBody(user);

      expect(body.action_type).toBe('inherit_parent_tags');
      expect(body.options).toEqual({
        parent_type: 'storage',
        cats: ['prov_max_cpu'],
      });
    });

    it('should post the category values for remove_tags', async() => {
      const { user } = await renderForm();
      await fillBasics(user, 'remove_tags');
      await user.click(
        await screen.findByRole('combobox', { name: /Categories/ })
      );
      await user.click(await screen.findByText('Auto Approve - Max Memory'));
      await user.click(await screen.findByText('Auto Approve - Max CPU'));

      const body = await submitAndGetBody(user);

      expect(body.action_type).toBe('remove_tags');
      expect(body.options).toEqual({
        cats: ['prov_max_memory', 'prov_max_cpu'],
      });
    });
  });

  describe('edit mode', () => {
    const record = (overrides) => ({
      id: '1',
      name: 'Existing',
      description: 'Existing',
      ...overrides,
    });

    const renderEdit = async(response, props = {}) => {
      fetchMock.get('http://localhost/api/actions/1', response);
      const user = userEvent.setup();
      const view = renderWithRedux(
        <ActionForm {...initialProps} {...props} recordId="1" />
      );
      await waitFor(() => {
        expect(view.container.querySelector('form')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          view.container.querySelectorAll('#action_type option').length
        ).toBeGreaterThan(1);
      });
      return { user, ...view };
    };

    it('should not render the form before the record is loaded', async() => {
      fetchMock.get('http://localhost/api/actions/1', new Promise(() => {}));
      const { container } = renderWithRedux(
        <ActionForm {...initialProps} recordId="1" />
      );

      expect(container.querySelector('form')).not.toBeInTheDocument();
    });

    it('should load the record and populate the initial values', async() => {
      await renderEdit(
        record({ action_type: 'create_snapshot', options: { name: 'snap' } })
      );

      expect(
        fetchMock.callHistory.called('http://localhost/api/actions/1')
      ).toBe(true);
      expect(document.querySelector('#description')).toHaveValue('Existing');
      await waitFor(() =>
        expect(document.querySelector('#action_type')).toHaveValue(
          'create_snapshot'
        ));
      expect(await screen.findByLabelText('Snapshot Name')).toHaveValue('snap');
    });

    it('should render the Save and Reset buttons', async() => {
      await renderEdit(
        record({ action_type: 'create_snapshot', options: { name: 'snap' } })
      );

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Add' })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    });

    it('should strip /managed/ from the tag', async() => {
      await renderEdit(
        record({
          action_type: 'tag',
          options: { tags: ['/managed/prov_max_cpu/3'] },
        })
      );

      await waitFor(() =>
        expect(screen.getByLabelText(/Tag to Apply/)).toHaveValue(
          'prov_max_cpu/3'
        ));
    });

    describe('ansible inventory initial value', () => {
      const ansibleRecord = () =>
        record({
          action_type: 'run_ansible_playbook',
          options: { service_template_name: ['Blue Demo Raw'] },
        });

      it.each([
        ['localhost', 'LocalHost'],
        ['event_target', 'Target Machine'],
        ['hosts', 'Specific Hosts'],
      ])('should check the %s inventory as %s', async(inventoryType, label) => {
        await renderEdit(ansibleRecord(), { inventoryType });

        expect(await screen.findByLabelText(label)).toBeChecked();
        ['LocalHost', 'Target Machine', 'Specific Hosts']
          .filter((other) => other !== label)
          .forEach((other) =>
            expect(screen.getByLabelText(other)).not.toBeChecked());
      });
    });

    it('should convert the ae_hash into attribute/value pairs for custom_automation', async() => {
      await renderEdit(
        record({
          action_type: 'custom_automation',
          options: {
            ae_message: 'msg',
            ae_request: 'req',
            ae_hash: { first: '1', second: '2' },
          },
        })
      );

      expect(await screen.findByLabelText('Message:')).toHaveValue('msg');
      expect(screen.getByLabelText('Request:')).toHaveValue('req');
      const attributes = Array.from(
        document.querySelectorAll('input[name$=".attribute"]')
      ).map((input) => input.value);
      const values = Array.from(
        document.querySelectorAll('input[name$=".value"]')
      ).map((input) => input.value);
      expect(attributes).toEqual(['first', 'second']);
      expect(values).toEqual(['1', '2']);
    });

    it('should patch the record and redirect to its show page', async() => {
      fetchMock.patch('http://localhost/api/actions/1', {});
      const { user } = await renderEdit(
        record({ action_type: 'create_snapshot', options: { name: 'snap' } })
      );
      const description = document.querySelector('#description');
      await user.clear(description);
      await user.type(description, 'Renamed');
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(miqRedirectBack).toHaveBeenCalled());
      const [call] = fetchMock.callHistory.calls(
        'http://localhost/api/actions/1',
        { method: 'PATCH' }
      );
      expect(JSON.parse(call.options.body)).toEqual({
        name: 'Renamed',
        description: 'Renamed',
        action_type: 'create_snapshot',
        options: { name: 'snap' },
      });
      expect(miqRedirectBack).toHaveBeenCalledWith(
        'New action "Renamed" has been successfully queued.',
        'success',
        '/miq_action/show/1'
      );
    });

    it('should call miqRedirectBack with a warning when canceled', async() => {
      const { user } = await renderEdit(
        record({ action_type: 'create_snapshot', options: { name: 'snap' } })
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(miqRedirectBack).toHaveBeenCalledWith(
        'Edit of Action "Existing" was canceled by the user.',
        'warning',
        '/miq_action/show/1'
      );
    });
  });
});
