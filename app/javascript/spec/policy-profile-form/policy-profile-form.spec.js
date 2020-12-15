import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import PolicyProfileForm from '../../components/policy-profile-form';
import { mount } from '../helpers/mountForm';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('PolicyProfileForm form component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render adding form variant', () => {
    const wrapper = shallow(<PolicyProfileForm />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render editing form variant', async(done) => {
    const url = '/api/policy_profiles/1?attributes=name,description,set_data,miq_policies&expand=miq_policies';
    fetchMock.getOnce(url, { name: 'foo', miq_policies: [] });
    fetchMock.getOnce('/api/policies?attributes=id,display_name&expand=resources', { resources: [] });
    let wrapper;
    await act(async() => {
      wrapper = mount(<PolicyProfileForm recordId="1" />);
    });
    expect(fetchMock.called(url)).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
