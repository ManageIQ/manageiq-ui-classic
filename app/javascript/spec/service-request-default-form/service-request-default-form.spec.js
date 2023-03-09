import React from 'react';
import { act } from 'react-dom/test-utils';
import toJson from 'enzyme-to-json';
import ServiceRequestDefault from '../../components/service-request-default';
import { mount } from '../helpers/mountForm';
import { sampleData } from './dummy-data';

describe('Show Service Request Page', () => {
  it('should render', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<ServiceRequestDefault miqRequestInitialOptions={sampleData} />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
