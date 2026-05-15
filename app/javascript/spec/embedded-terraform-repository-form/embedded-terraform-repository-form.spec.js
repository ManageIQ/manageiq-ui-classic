import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import EmbeddedTerraformRepositoryForm from '../../components/embedded-terraform-repository-form';

import '../helpers/miqSparkle';

describe('Embedded Terraform Repository form component', () => {
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
    href: 'http://localhost:3000/api/configuration_script_sources/46',
    id: '46',
    name: 'embedded_terraform_repository_test',
    scm_branch: '',
    scm_url: 'github.com:ManageIQ/workflows-examples',
    verify_ssl: 0,
  };

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');

    // Mock the provider API call
    fetchMock.get(
      '/api/providers?collection_class=ManageIQ::Providers::EmbeddedTerraform::AutomationManager',
      {
        resources: [{ href: 'http://localhost:3000/api/providers/77' }],
      }
    );

    // Mock the credentials API call
    fetchMock.get(
      '/api/authentications?collection_class=ManageIQ::Providers::EmbeddedTerraform::AutomationManager::ScmCredential&expand=resources&sort_by=name&sort_order=ascending',
      {
        resources: [],
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
    const { container } = renderWithRedux(<EmbeddedTerraformRepositoryForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render edit variant', async() => {
    fetchMock.get(
      `/api/configuration_script_sources/46?attributes=${attributes.join(',')}`,
      repositoryMock
    );
    const { container } = renderWithRedux(
      <EmbeddedTerraformRepositoryForm repositoryId="46" />
    );

    await waitFor(() => {
      expect(
        fetchMock.called(
          `/api/configuration_script_sources/46?attributes=${attributes.join(',')}`
        )
      ).toBe(true);
    });

    expect(container).toMatchSnapshot();
  });

  it('should submit add form', async() => {
    const { container } = renderWithRedux(<EmbeddedTerraformRepositoryForm />);
    const data = {
      authentication_id: '',
      description: 'workflows for testing',
      name: 'embedded terraform repository add test',
      scm_branch: '',
      scm_url: 'github.com:ManageIQ/workflows-examples',
      verify_ssl: true,
      manager_provider: { href: 'http://localhost:3000/api/providers/77' },
    };
    fetchMock.postOnce('/api/configuration_script_sources/', data);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should submit edit form', async() => {
    const { container } = renderWithRedux(<EmbeddedTerraformRepositoryForm />);
    fetchMock.get(
      `/api/configuration_script_sources/46?attributes=${attributes.join(',')}`,
      repositoryMock
    );
    const data = {
      authentication_id: null,
      description: 'workflows for testing',
      name: 'embedded terraform repository edit test',
      scm_branch: '',
      scm_url: 'github.com:ManageIQ/workflows-examples',
      verify_ssl: false,
    };
    fetchMock.postOnce('/api/configuration_script_sources/46', data);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
