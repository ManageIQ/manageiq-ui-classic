import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import EmbeddedTerraformCredentialsForm from '../../components/embedded-terraform-credentials-form';

describe('Embedded Terraform Credential Form Component', () => {
  const api = {
    data: {
      credential_types: {
        embedded_terraform_credential_types: {
          foo: {
            attributes: [
              {
                component: 'text-field',
                helperText: 'Unique reference for this credential',
                id: 'ems_ref',
                isRequired: true,
                label: 'Reference',
                name: 'ems_ref',
              },
            ],
            label: 'Embedded Terraform',
          },
          bar: {
            attributes: [],
          },
        },
      },
    },
  };

  beforeEach(() => {
    fetchMock.get(
      '/api/providers?collection_class=ManageIQ::Providers::EmbeddedTerraform::AutomationManager',
      {
        resources: [
          {
            href: 'http://localhost:3000/api/providers/77',
          },
        ],
      }
    );
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render adding a new credential', async() => {
    fetchMock.once('/api/authentications', api);

    const { container } = renderWithRedux(<EmbeddedTerraformCredentialsForm />);

    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(2);
    });

    expect(container).toMatchSnapshot();
  });

  it('should render editing a credential', async() => {
    fetchMock.once('/api/authentications', api);
    fetchMock.get('/api/authentications/1', { ems_ref: 'test', type: 'foo' });

    const { container } = renderWithRedux(
      <EmbeddedTerraformCredentialsForm recordId="1" />
    );

    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(3);
    });

    expect(container).toMatchSnapshot();
  });
});
