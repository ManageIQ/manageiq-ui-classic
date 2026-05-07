import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import WorkflowCredentialsForm from '../../components/workflow-credentials-form/index';

describe('Workflow Credential Form Component', () => {
  const api = {
    data: {
      credential_types: {
        workflows_credential_types: {
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
            label: 'Workflow',
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
      '/api/providers?collection_class=ManageIQ::Providers::Workflows::AutomationManager',
      {
        resources: [
          {
            href: 'http://localhost:3000/api/providers/1',
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

    const { container } = renderWithRedux(<WorkflowCredentialsForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(2);
    expect(container).toMatchSnapshot();
  });

  it('should render editing a credential', async() => {
    fetchMock.once('/api/authentications', api);
    fetchMock.get('/api/authentications/1', { ems_ref: 'test', type: 'foo' });

    const { container } = renderWithRedux(
      <WorkflowCredentialsForm recordId="1" />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(3);
    expect(container).toMatchSnapshot();
  });
});
