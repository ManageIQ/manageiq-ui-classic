import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import HostAggregateForm from '../../components/host-aggregate-form';
import { mount } from '../helpers/mountForm';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Host aggregate form component', () => {
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
    const wrapper = shallow(<HostAggregateForm />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render editing form variant', async(done) => {
    fetchMock.getOnce('/api/host_aggregates/1', { name: 'foo' });
    let wrapper;
    await act(async() => {
      wrapper = mount(<HostAggregateForm recordId="1" />);
    });
    expect(fetchMock.called('/api/host_aggregates/1')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
