import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import ScheduleForm from '../../components/schedule-form/index';
import {
  scheduleResponse1, scheduleResponse2, timezones, actionOptions, filterOptions, resources, actionResponse, targets,
} from './data';
import { mount } from '../helpers/mountForm';

require('../helpers/miqSparkle.js');

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('Schedule form component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render schedule add form', async(done) => {
    fetchMock.get('/api', { timezones });
    let wrapper;
    await act(async() => {
      wrapper = mount(<ScheduleForm recordId="new" actionOptions={actionOptions} filterOptions={filterOptions} />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render edit form when filter_type is not null', async(done) => {
    fetchMock.getOnce('/api', { timezones });
    fetchMock.getOnce('/ops/schedule_form_fields/1', scheduleResponse1);
    fetchMock.getOnce('/api/zones/?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending', { resources });
    let wrapper;
    await act(async() => {
      wrapper = mount(<ScheduleForm recordId="1" actionOptions={actionOptions} filterOptions={filterOptions} />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(3);
    expect(wrapper.find('attribute_1')).toHaveLength(0);
    expect(wrapper.find('value_1')).toHaveLength(0);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render edit form when filter_type is null', async(done) => {
    const zoneUrl = '/api/zones/?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending';
    fetchMock.getOnce('/api', { timezones });
    fetchMock.getOnce('/ops/schedule_form_fields/1', scheduleResponse2);
    fetchMock.getOnce(zoneUrl, { resources });
    fetchMock.postOnce('/ops/automate_schedules_set_vars/new', actionResponse);
    fetchMock.postOnce('/ops/fetch_target_ids/?target_class=AvailabilityZone', { targets });
    fetchMock.getOnce(zoneUrl, { resources }, { overwriteRoutes: false });
    let wrapper;
    await act(async() => {
      wrapper = mount(<ScheduleForm recordId="1" actionOptions={actionOptions} filterOptions={filterOptions} />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(6);
    expect(wrapper.find('attribute_1')).toBeDefined();
    expect(wrapper.find('value_1')).toBeDefined();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
