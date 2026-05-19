import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import ActionForm from '../../components/action-form/index';
import { renderWithRedux } from '../helpers/mountForm';

const api = {
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

describe('Action Form Component', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      inheritTags: [
        ['prov_max_cpu', 'Auto Approve - Max CPU'],
        ['prov_max_memory', 'Auto Approve - Max Memory'],
      ],
      availableAlerts: [
        ['CPU Ready > 4000 ms for more than 10 min', 'd59185a4-40bc-11de-bd12-005056a170fa'],
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
      promise: jest.fn().mockReturnValue(new Promise((resolve) => resolve(api))),
    };
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render correctly', async() => {
    const { container } = renderWithRedux(<ActionForm {...initialProps} />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render adding a new action', async() => {
    const { container } = renderWithRedux(<ActionForm {...initialProps} />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
