import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor, cleanup } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import CustomButtonForm from '../../components/generic-objects-form/custom-button-form';

import '../helpers/miqAjaxButton';

describe('Custom Button form component', () => {
  let submitSpy;
  const distinctInstances = [
    'Automation',
    'Event',
    'GenericObject',
    'MiqEvent',
    'Request',
    'parse_automation_request',
    'parse_event_stream',
    'parse_provider_category',
  ];
  const ansiblePlaybooks = [
    { name: 'Blue Demo Raw', id: 55 },
    { name: 'CF create user', id: 78 },
    { name: 'Deploy RHEL7 on VMware', id: 15 },
    { name: 'Deploy Ticket Monster on AWS', id: 14 },
    { name: 'LB', id: 129 },
    { name: 'MyPBaaS', id: 4 },
    { name: 'OpenStack Application SLA Catalog Item', id: 32 },
    { name: 'SimplePing', id: 49 },
    { name: 'demo playbook', id: 69 },
  ];
  const buttonTypes = {
    data: { custom_button_types: { default: 'Default', ansible_playbook: 'Ansible Playbook' } },
  };
  const roles = {
    resources: [
      { href: 'http://localhost:3000/api/roles/1', name: 'EvmRole-super_administrator', id: '1' },
      { href: 'http://localhost:3000/api/roles/2', name: 'EvmRole-administrator', id: '2' },
      { href: 'http://localhost:3000/api/roles/4', name: 'EvmRole-auditor', id: '4' },
    ],
  };
  const serviceDialogs = {
    resources: [
      { href: 'http://localhost:3000/api/service_dialogs/1', label: 'Transform VM', id: '1' },
      { href: 'http://localhost:3000/api/service_dialogs/30', label: 'amq-demo', id: '30' },
      { href: 'http://localhost:3000/api/service_dialogs/3', label: 'Confirmation', id: '3' },
    ],
  };
  const initialValues = {
    applies_to_class: 'GenericObjectDefinition',
    applies_to_id: '60',
    description: 'This is a solo button.',
    dialog_id: '30',
    id: '128',
    inventory_type: 'manual',
    options: {
      button_color: '#1bc918',
      button_icon: 'ff ff-cloud-network',
      button_type: 'ansible_playbook',
      display: true,
      display_for: 'list',
      submit_how: 'all',
    },
    resource_action: {
      ae_attributes: {
        hosts: '192.168.0.1',
        request: 'Order_Ansible_Playbook',
        service_template_name: 'CF create user',
      },
      ae_class: 'PROCESS',
      ae_namespace: 'SYSTEM',
      dialog_id: '30',
      id: '8294',
      resource_id: '128',
      resource_type: 'CustomButton',
    },
    uri_attributes: {
      hosts: '192.168.0.1',
      request: 'create',
      service_template_name: 'CF create user',
    },
    visibility: { roles: ['_ALL_'] },
  };
  beforeEach(() => {
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    cleanup();
    fetchMock.restore();
    jest.clearAllMocks();
    submitSpy.mockRestore();
  });

  it('should render the adding form for generic obj buttons', async() => {
    fetchMock.mock('/api/custom_buttons', buttonTypes, { method: 'Options' });
    fetchMock.get('/api/roles?expand=resources&attributes=name', roles);
    fetchMock.get('/api/service_dialogs?expand=resources&attributes=label', serviceDialogs);

    const { container } = renderWithRedux(
      <CustomButtonForm
        url="/generic_object_definition/show_list"
        appliesToClass="GenericObjectDefinition"
        appliesToId="60"
        distinctInstances={distinctInstances}
        ansiblePlaybooks={ansiblePlaybooks}
      />
    );

    await waitFor(() => {
      expect(fetchMock.calls('/api/roles?expand=resources&attributes=name').length).toBe(1);
      expect(fetchMock.calls('/api/service_dialogs?expand=resources&attributes=label').length).toBe(1);
    });

    expect(container).toMatchSnapshot();
  });

  it('should render the editing form for generic object custom buttons', async() => {
    fetchMock.mock('/api/custom_buttons', buttonTypes, { method: 'OPTIONS' });
    fetchMock.get('/api/roles?expand=resources&attributes=name', roles);
    fetchMock.get('/api/service_dialogs?expand=resources&attributes=label', serviceDialogs);
    fetchMock.get('/api/custom_buttons/128?attributes=resource_action,uri_attributes', initialValues);

    const { container } = renderWithRedux(
      <CustomButtonForm
        recId={128}
        url="/generic_object_definition/show_list"
        appliesToClass="GenericObjectDefinition"
        distinctInstances={distinctInstances}
        ansiblePlaybooks={ansiblePlaybooks}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should add a new generic object custom button', async() => {
    const submitValues = {
      applies_to_class: 'GenericObjectDefinition',
      applies_to_id: '60',
      description: 'This is a test button.',
      name: 'Test Btn',
      options: {
        button_color: '#24c260',
        button_icon: 'ff ff-array',
        button_type: 'default',
        display: true,
        display_for: 'single',
        submit_how: 'one',
      },
      resource_action: {
        ae_class: 'PROCESS',
        ae_instance: 'Request',
        ae_message: 'create',
        ae_namespace: 'SYSTEM',
        dialog_id: '30',
      },
      uri_attributes: {
        request: 'test',
      },
      visibility: { roles: ['_ALL_'] },
    };

    fetchMock.mock('/api/custom_buttons', buttonTypes, { method: 'Options' });
    fetchMock.get('/api/roles?expand=resources&attributes=name', roles);
    fetchMock.get('/api/service_dialogs?expand=resources&attributes=label', serviceDialogs);
    fetchMock.postOnce('/api/custom_buttons/', submitValues);

    const { container } = renderWithRedux(
      <CustomButtonForm
        url="/generic_object_definition/show_list"
        appliesToClass="GenericObjectDefinition"
        appliesToId="60"
        distinctInstances={distinctInstances}
        ansiblePlaybooks={ansiblePlaybooks}
      />
    );

    await waitFor(() => {
      expect(fetchMock.calls('/api/roles?expand=resources&attributes=name').length).toBe(1);
      expect(fetchMock.calls('/api/service_dialogs?expand=resources&attributes=label').length).toBe(1);
    });

    expect(container).toMatchSnapshot();
  });

  it('should edit a generic object custom button', async() => {
    const submitValues = {
      applies_to_class: 'GenericObjectDefinition',
      applies_to_id: '60',
      description: 'This is a new button description.',
      name: 'New Name',
      options: {
        button_color: '#00ffee',
        button_icon: 'fa fa-th-large',
        button_type: 'default',
        display: false,
        display_for: 'list',
        submit_how: 'all',
      },
      resource_action: {
        ae_class: 'PROCESS',
        ae_namespace: 'SYSTEM',
        dialog_id: '30',
      },
      uri_attributes: {
        request: 'create',
      },
      visibility: {
        roles: ['EvmRole-super_administrator', 'EvmRole-approver'],
      },
    };
    fetchMock.mock('/api/custom_buttons', buttonTypes, { method: 'Options' });
    fetchMock.get('/api/roles?expand=resources&attributes=name', roles);
    fetchMock.get('/api/service_dialogs?expand=resources&attributes=label', serviceDialogs);
    fetchMock.get('/api/custom_buttons/128?attributes=resource_action,uri_attributes', initialValues);
    fetchMock.putOnce('/api/custom_buttons/128', submitValues);

    const { container } = renderWithRedux(
      <CustomButtonForm
        recId={128}
        url="/generic_object_definition/show_list"
        appliesToClass="GenericObjectDefinition"
        distinctInstances={distinctInstances}
        ansiblePlaybooks={ansiblePlaybooks}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
