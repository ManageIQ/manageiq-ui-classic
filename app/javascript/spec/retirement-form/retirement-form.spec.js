import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';

import { mount } from '../helpers/mountForm';
import RetirementForm from '../../components/retirement-form/index';

describe('Retirement Form Component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render a new Retirement form', async(done) => {
    let wrapper;
    const timezone = { tzinfo: { info: { identifier: 'America/New York' } } };
    await act(async() => {
      wrapper = mount(<RetirementForm retirementID={'["180"]'} url="/api/services" timezone={timezone} />);
    });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should submit Retirement Form with correct date and time', async(done) => {
    let wrapper;
    const retire = {
      retires_on: '2021-10-02T00:50:00Z',
      retirement_warn: null,
    };
    await act(async() => {
      wrapper = mount(<RetirementForm retirementID={'["42"]'} url="/api/services" {...retire} />);
    });
    fetchMock.getOnce('/api/services/42?attributes=retires_on,retirement_warn', retire);

    const retirementDate = new Date('2021-10-02T00:50:00Z');
    retirementDate.setMonth(11);
    retirementDate.setDate(25);
    retirementDate.setHours(15);
    retirementDate.setMinutes(59);

    expect(retirementDate).toEqual(new Date('2021-12-25T20:59:00.000Z'));

    const resources = [{
      id: '42',
      date: retirementDate,
      warn: 14,
    }];
    const postData = { action: 'request_retire', resources };
    fetchMock.postOnce('/api/services', postData);
    wrapper.update();

    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find(RetirementForm).props().retires_on).toEqual('2021-10-02T00:50:00Z');
    expect(wrapper.find(RetirementForm).props().retirement_warn).toEqual(null);
    done();
  });
});
