import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import WorkflowRepositoryForm from '../../components/workflow-repository-form';

import '../helpers/miqSparkle';

describe('Workflow Repository form component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;

  const attributes = [
    'name',
    'description',
    'scm_url',
    'verify_ssl',
    'authentication_id',
    'scm_branch',
  ];

  const repositoryMock = {
    authentication_id: null,
    description: 'workflows for testing',
    href: 'http://localhost:3000/api/configuration_script_sources/33',
    id: '33',
    name: 'workflow_repository_test',
    scm_branch: '',
    scm_url: 'github.com:ManageIQ/workflows-examples',
    verify_ssl: 0,
  };

  const authenticationsMock = {
    resources: [],
  };

  const providersMock = {
    resources: [
      {
        href: 'http://localhost:3000/api/providers/2',
        id: '2',
        name: 'Embedded Workflow Provider',
      },
    ],
  };

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    // Mock the API calls that the form makes
    fetchMock.get(
      '/api/authentications?collection_class=ManageIQ::Providers::Workflows::AutomationManager::ScmCredential&expand=resources&sort_by=name&sort_order=ascending',
      authenticationsMock
    );
    fetchMock.get(
      '/api/providers?collection_class=ManageIQ::Providers::Workflows::AutomationManager',
      providersMock
    );
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
  });

  it('should render add form', async() => {
    const { container } = renderWithRedux(<WorkflowRepositoryForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render edit variant', async() => {
    fetchMock.get(
      `/api/configuration_script_sources/33?attributes=${attributes.join(',')}`,
      repositoryMock
    );

    const { container } = renderWithRedux(
      <WorkflowRepositoryForm repositoryId="33" />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should submit add form', async() => {
    const data = {
      authentication_id: '149',
      description: 'workflows for testing',
      name: 'workflow add test',
      scm_branch: '',
      scm_url: 'github.com:ManageIQ/workflows-examples',
      verify_ssl: true,
      manager_provider: { href: 'http://localhost:3000/api/providers/2' },
    };
    fetchMock.postOnce('/api/configuration_script_sources/', data);

    const { container } = renderWithRedux(<WorkflowRepositoryForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should submit edit form', async() => {
    fetchMock.get(
      `/api/configuration_script_sources/33?attributes=${attributes.join(',')}`,
      repositoryMock
    );
    const data = {
      authentication_id: null,
      description: 'workflows for testing',
      name: 'workflow edit test',
      scm_branch: '',
      scm_url: 'github.com:ManageIQ/workflows-examples',
      verify_ssl: false,
    };
    fetchMock.postOnce('/api/configuration_script_sources/33', data);

    const { container } = renderWithRedux(<WorkflowRepositoryForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
