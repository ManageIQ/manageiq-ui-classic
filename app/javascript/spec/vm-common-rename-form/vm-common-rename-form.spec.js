import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import VmCommonRenameForm from '../../components/vm-common-rename-form';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('VM common form component', () => {
  let submitSpy;
  beforeEach(() => {
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });
  it('should render editing form variant 1', () => {
    const wrapper = shallow(<VmCommonRenameForm />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  it('should render editing form variant 2', async(done) => {
    const data = {
      action: 'rename',
      new_name: 'Test1',
    };
    fetchMock.getOnce('api/vms/4351', { name: 'CF 4.7  5.10.33 Template' });
    fetchMock.postOnce('/api/vms/4351', data);
    let wrapper;
    await act(async() => {
      wrapper = mount(<VmCommonRenameForm vmId="4351" />);
    });
    expect(fetchMock.called('/api/vms/4351')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
