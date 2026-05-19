import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import AnsibleRepositoryForm from '../../components/ansible-repository-form';

import '../helpers/miqSparkle';

describe('Ansible Repository form component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;

  const attributes = ['name', 'description', 'scm_url', 'verify_ssl', 'authentication_id', 'scm_branch'];

  const repositoryMock = {
    authentication_id: null,
    description: 'playbooks for testing',
    href: 'http://localhost:3000/api/configuration_script_sources/23',
    id: '23',
    name: 'avaleror_test',
    scm_branch: '',
    scm_url: 'https://github.com/avaleror/ansible',
    verify_ssl: 0,
  };

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    // Mock the provider API call that happens on component mount
    fetchMock.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager', {
      resources: [{ href: 'http://localhost:3000/api/providers/2' }],
    });
    // Mock the credentials API call for the form schema
    fetchMock.get(
      `/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ScmCredential&expand=resources&sort_by=name&sort_order=ascending`,
      {
        resources: [{ id: '149', name: 'Test Credential' }],
      }
    );
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
  });

  it('should render add form', async() => {
    const { container } = renderWithRedux(<AnsibleRepositoryForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render edit variant', async() => {
    fetchMock.get(`/api/configuration_script_sources/31?attributes=${attributes.join(',')}`, repositoryMock);
    const { container } = renderWithRedux(<AnsibleRepositoryForm repositoryId="31" />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should submit add form', async() => {
    const data = {
      authentication_id: '149',
      description: 'playbooks for testing',
      name: 'avaleror_test',
      scm_branch: '',
      scm_url: 'https://github.com/avaleror/ansible',
      verify_ssl: true,
      manager_provider: { href: 'http://localhost:3000/api/providers/2' },
    };
    fetchMock.postOnce('/api/configuration_script_sources/', data);

    const { container } = renderWithRedux(<AnsibleRepositoryForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should submit edit form', async() => {
    fetchMock.get(`/api/configuration_script_sources/23?attributes=${attributes.join(',')}`, repositoryMock);
    const data = {
      authentication_id: null,
      description: 'playbooks for testing',
      name: 'avaleror_test1',
      scm_branch: '',
      scm_url: 'https://github.com/avaleror/ansible',
      verify_ssl: false,
    };
    fetchMock.postOnce('/api/configuration_script_sources/23', data);

    const { container } = renderWithRedux(<AnsibleRepositoryForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
