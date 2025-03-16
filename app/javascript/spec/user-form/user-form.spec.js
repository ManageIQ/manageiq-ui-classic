import React from 'react';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
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

  it('should render add User form correctly', async(done) => {
    const wrapper = shallow(<UserForm />);
    fetchMock.get('/api/groups?&expand=resources', groupsMockData);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render edit User form correclty', async(done) => {
    const wrapper = shallow(<UserForm id={40} data={userData} disabled={false} />);
    fetchMock.get('/api/groups?&expand=resources', groupsMockData);
    fetchMock.get('/api/users/41', userMockData);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render edit Admin User form correclty', async(done) => {
    const wrapper = shallow(<UserForm id={1} data={userData} disabled />);
    fetchMock.get('/api/groups?&expand=resources', groupsMockData);
    fetchMock.get('/api/users/1', adminMockData);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render copy User form correclty', async(done) => {
    const wrapper = shallow(<UserForm data={userData} />);
    fetchMock.get('/api/groups?&expand=resources', groupsMockData);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
