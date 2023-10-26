import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';

import { mount } from '../helpers/mountForm';
import DiagnosticsCURepairForm from '../../components/c-and-u-collections-form';
import { formatDate } from '../../components/c-and-u-collections-form/helper';

describe('DiagnosticsCURepairForm Component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  it('Should render a new DiagnosticsCURepair form', async() => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<DiagnosticsCURepairForm />);
    });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('Should add a record from DiagnosticsCURepair form', async(done) => {
    const paramsData = {
      timezone: 'UTC',
      start_date: formatDate('12/12/2023'),
      end_date: formatDate('12/01/2023'),
    };
    const timezones = [
      { name: 'International Date Line West', description: '(GMT-12:00) International Date Line West' },
      { name: 'American Samoa', description: '(GMT-11:00) American Samoa' },
      { name: 'Midway Island', description: '(GMT-11:00) Midway Island' },
      { name: 'Hawaii', description: '(GMT-10:00) Hawaii' },
      { name: 'Alaska', description: '(GMT-09:00) Alaska' },
    ];
    fetchMock.getOnce('/api', { timezones });
    fetchMock.postOnce('/api/instances/1850//ops/cu_repair?button=submit/', paramsData);
    const wrapper = mount(<DiagnosticsCURepairForm />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
