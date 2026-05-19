import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import AnsibleCredentialsForm from '../../components/ansible-credentials-form/index';

describe('Ansible Credential Form Component', () => {
  const api = {
    data: {
      credential_types: {
        embedded_ansible_credential_types: {
          foo: {
            attributes: [
              {
                component: 'text-field',
                helperText: 'AWS Access Key for this credential',
                id: 'userid',
                isRequired: true,
                label: 'Access Key',
                name: 'userid',
              },
            ],
            label: 'Amazon',
            type: 'cloud',
          },
          bar: {
            attributes: [],
          },
        },
      },
    },
  };

  beforeEach(() => {
    fetchMock.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager', {
      resources: [
        {
          href: 'http://localhost:3000/api/providers/1',
        },
      ],
    });
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render adding a new credential', async() => {
    fetchMock.once('/api/authentications', api);

    const { container } = renderWithRedux(<AnsibleCredentialsForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(2);
    expect(container).toMatchSnapshot();
  });

  it('should render editing a credential', async() => {
    fetchMock.once('/api/authentications', api);
    fetchMock.get('/api/authentications/1', { userid: 'test', type: 'foo' });

    const { container } = renderWithRedux(<AnsibleCredentialsForm recordId="1" />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(3);
    expect(container).toMatchSnapshot();
  });
});
