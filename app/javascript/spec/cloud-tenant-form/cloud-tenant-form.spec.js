import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import CloudTenantForm from '../../components/cloud-tenant-form';
import { mount } from '../helpers/mountForm';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Cloud tenant form component', () => {
  let emsChoices;
  let submitSpy;
  beforeEach(() => {
    emsChoices = {
      'Label 1': '1',
      'Label 2': '2',
      'Label 3': '3',
      'Label 4': '4',
    };
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  it('should render adding form variant', () => {
    const wrapper = shallow(<CloudTenantForm />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render editing form variant', async(done) => {
    fetchMock.getOnce('/api/cloud_tenants/1', { name: 'foo' });
    let wrapper;
    await act(async() => {
      wrapper = mount(<CloudTenantForm recordId="1" />);
    });
    expect(fetchMock.called('/api/cloud_tenants/1')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
