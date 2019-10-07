import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import CloudTenantForm from '../../components/cloud-tenant-form/cloud-tenant-form';
import { mount } from '../helpers/mountForm';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Cloud tenant form component', () => {
  let emsChoices;
  let submitSpy;
  beforeEach(() => {
    emsChoices = {
      'Label 1': 1,
      'Label 2': 2,
      'Label 3': 3,
      'Label 4': 4,
    };
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  it('should render adding form variant', () => {
    const wrapper = shallow(<CloudTenantForm emsChoices={emsChoices} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render editing form variant', () => {
    fetchMock
      .getOnce('/cloud_tenant/cloud_tenant_form_fields/1', { name: 'foo' });
    const wrapper = shallow(<CloudTenantForm cloudTenantFormId={1} />);
    expect(fetchMock._calls[0]).toHaveLength(2);
    expect(fetchMock._calls[0][0]).toEqual('/cloud_tenant/cloud_tenant_form_fields/1');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should call cancel callback ', () => {
    const wrapper = mount(<CloudTenantForm emsChoices={emsChoices} />);

    const button = wrapper.find('button').last();
    button.simulate('click');
    expect(submitSpy).toHaveBeenCalledWith('/cloud_tenant/create/new?button=cancel');
  });
});
