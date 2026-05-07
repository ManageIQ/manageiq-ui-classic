import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import UserForm from '../../components/user-form/index';

describe('User Form Component', () => {
  const groupsMockData = [
    {
      href: 'http://localhost:3000/api/groups/2',
      id: '2',
      description: 'EvmGroup-super_adminstrator',
    },
    {
      href: 'http://localhost:3000/api/groups/3',
      id: '3',
      description: 'EvmGroup-operator',
    },
    {
      href: 'http://localhost:3000/api/groups/4',
      id: '4',
      description: 'EvmGroup-user',
    },
  ];

  const userMockData = {
    current_group_id: '40',
    email: 'test@email.com',
    id: '41',
    name: 'test name',
    userid: 'testuser',
  };

  const adminMockData = {
    current_group_id: '40',
    email: 'test@email.com',
    id: '1',
    name: 'Administrator',
    userid: 'admin',
  };

  const userData = {
    current_group_id: '2',
    email: 'test@email.com',
    name: 'test name',
    userid: 'testuser',
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render add User form correctly', async() => {
    fetchMock.get('/api/groups?&expand=resources', {
      resources: groupsMockData,
    });

    const { container } = renderWithRedux(<UserForm dbMode="database" />);
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render edit User form correclty', async() => {
    fetchMock.get('/api/groups?&expand=resources', {
      resources: groupsMockData,
    });
    fetchMock.get('/api/users/40?&attributes=miq_groups', {
      ...userMockData,
      miq_groups: [],
    });

    const { container } = renderWithRedux(
      <UserForm id={40} data={userData} disabled={false} dbMode="database" />
    );
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render edit Admin User form correclty', async() => {
    fetchMock.get('/api/groups?&expand=resources', {
      resources: groupsMockData,
    });
    fetchMock.get('/api/users/1?&attributes=miq_groups', {
      ...adminMockData,
      miq_groups: [],
    });

    const { container } = renderWithRedux(
      <UserForm id={1} data={userData} disabled dbMode="database" />
    );
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render copy User form correclty', async() => {
    fetchMock.get('/api/groups?&expand=resources', {
      resources: groupsMockData,
    });

    const { container } = renderWithRedux(
      <UserForm data={userData} dbMode="database" />
    );
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
