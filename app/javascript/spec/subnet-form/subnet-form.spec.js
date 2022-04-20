import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import SubnetForm from '../../components/subnet-form';
import { mount } from '../helpers/mountForm';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Subnet form component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('renders the adding form variant', () => {
    const wrapper = shallow(<SubnetForm />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('renders the editing form variant', async(done) => {
    fetchMock.get('/api/providers?expand=resources&attributes=id,name,supports_cloud_subnet_create&filter[]=supports_cloud_subnet_create=true', {
      resources: [{ label: 'foo', value: 1 }],
    });
    fetchMock.getOnce('/api/cloud_subnets/1', { name: 'foo', ems_id: 1 });
    fetchMock.mock('/api/cloud_subnets/1', { data: { form_schema: { fields: [] } } }, { method: 'OPTIONS' });
    let wrapper;
    await act(async() => {
      wrapper = mount(<SubnetForm recordId="1" />);
    });
    expect(fetchMock.called('/api/cloud_subnets/1')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
