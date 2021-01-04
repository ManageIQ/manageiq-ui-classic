import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import { shallow } from 'enzyme';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import '../helpers/miqSparkle';
import { mount } from '../helpers/mountForm';
import AuthKeypairCloudForm from '../../components/auth-key-pair-cloud/index';

describe('Add testcases for creating new auth key pair', () => {
  const emsList = {
    resources: [
      { name: 'name1', id: 1 },
      { name: 'name2', id: 2 },
    ],
  };

  const values = {
    name: 'key1',
    public_key: 'abc',
    ems_id: 2,
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render a auth key pair form', (done) => {
    fetchMock
      .mock('/api/providers?expand=resources&attributes=id,name,supports_auth_key_pair_create&filter[]=supports_auth_key_pair_create=true', emsList);
    const wrapper = shallow(<AuthKeypairCloudForm />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should correctly add new key pair .', async(done) => {
    fetchMock
      .mock('/api/providers?expand=resources&attributes=id,name,supports_auth_key_pair_create&filter[]=supports_auth_key_pair_create=true', emsList);
    fetchMock.postOnce('/api/auth_key_pairs', values);
    const wrapper = mount(<AuthKeypairCloudForm />);
    wrapper.find('input').at(0).simulate('change', { target: { value: 'key1' } });
    wrapper.update();
    await act(async() => {
      wrapper.find('button').first().simulate('click');
    });
    expect(fetchMock.calls()).toHaveLength(2);
    done();
  });

  it('should call miqRedirectBack when canceling form', async(done) => {
    fetchMock
      .mock('/api/providers?expand=resources&attributes=id,name,supports_auth_key_pair_create&filter[]=supports_auth_key_pair_create=true', emsList);
    let wrapper;
    await act(async() => {
      wrapper = mount(<AuthKeypairCloudForm />);
    });
    wrapper.find('button').last().simulate('click');

    expect(miqRedirectBack).toHaveBeenCalledWith('Add of new Key Pair was cancelled by the user', 'warning', '/auth_key_pair_cloud/show_list');
    done();
  });
});
