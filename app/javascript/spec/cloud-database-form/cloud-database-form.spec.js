import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CloudDatabaseForm from '../../components/cloud-database-form/cloud-database-form';
import { renderWithRedux } from '../helpers/mountForm';
import miqRedirectBack from '../../helpers/miq-redirect-back';

describe('Cloud Database form component', () => {
  const dropdownOptions = {
    resources: [
      { name: 'Blue', id: '1' },
      { name: 'Yellow', id: '2' },
      { name: 'Green', id: '3' },
    ],
  };

  const initialData = {
    ems_id: '1',
    name: 'Test Database',
  };

  const response = {
    data: {
      form_schema: {
        fields: [
          {
            component: 'text-field',
            name: 'Sample Component',
            id: 'sample_component',
            label: _('Sample Component'),
            isRequired: true,
            validate: [{ type: 'required' }],
          },
        ],
      },
    },
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render "Add New" form', async() => {
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_cloud_database_create,type&filter[]=supports_cloud_database_create=true',
      dropdownOptions
    );

    const { container } = renderWithRedux(<CloudDatabaseForm />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render "Edit" form', async() => {
    fetchMock.getOnce('/api/cloud_databases/1', initialData);
    fetchMock.mock('/api/cloud_databases/1?ems_id=1', response, { method: 'OPTIONS' });
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_cloud_database_create,type&filter[]=supports_cloud_database_create=true',
      dropdownOptions
    );

    const { container } = renderWithRedux(<CloudDatabaseForm recordId="1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should call miqRedirectBack when canceling "Add New" form', async() => {
    const user = userEvent.setup();
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_cloud_database_create,type&filter[]=supports_cloud_database_create=true',
      dropdownOptions
    );

    renderWithRedux(<CloudDatabaseForm />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(miqRedirectBack).toHaveBeenCalledWith('Creation of new Cloud Database was canceled by the user.', 'warning', '/cloud_database/show_list');
  });
});
