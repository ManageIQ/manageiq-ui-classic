import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';

import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import RetirementForm from '../../components/retirement-form/index';

const retirementForm = require('../../components/retirement-form/index');
describe('Retirement Form Component', () => {
  const retire = {
    retires_on: new Date('2024-06-08T15:49:04.816Z'),
    retirement_warn: '',
    formMode: 'date',

  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render a new Retirement form', async(done) => {
    const wrapper = shallow(<RetirementForm retirementID={'["180"]'}/>);
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render Retirement Form with a set retirement date', async(done) => {
    fetchMock.get(`/api/services/42?attributes=retires_on,retirement_warn`, retire);
    let wrapper;
    await act(async() => {
      wrapper = mount(<RetirementForm retirementID={'["42"]'} {...retire} />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('input[name="retirementWarning"]').instance().value).toEqual('');
    expect(wrapper.find('input[name="formMode"]').instance().value).toEqual('date');
    done();
  });
});
