import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import SettingsTimeProfileForm from '../../components/settings-time-profile-form';

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
  it('should render adding form variant blank form', () => {
    const wrapper = shallow(<SettingsTimeProfileForm timeProfileId="" timezones="" action="timeprofile_add" userid="admin" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  it('should render adding form variant add new time profile', async(done) => {
    const data = {
      action: 'create',
      profile_key: 'admin',
      description: 'TestAdd',
      profile_type: 'global',
      profile: {
        days: [0, 1, 2, 3, 4, 5, 6],
        hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        tz: 'UTC',
      },
      rollup_daily_metrics: false,
    };
    fetchMock.postOnce('/api/time_profiles', data);
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsTimeProfileForm timeProfileId="" timezones="" action="timeprofile_add" userid="admin" />);
    });
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
  it('should render editing form variant all new values', async(done) => {
    const data = {
      action: 'edit',
      description: 'UTC1',
      profile_type: 'global',
      profile_key: 'user1',
      profile: {
        days: [0, 1],
        hours: [11, 12, 13, 14, 15, 19, 20, 21, 22, 23],
        tz: 'International Date Line West',
      },
      rollup_daily_metrics: true,
    };
    fetchMock.getOnce('api/time_profiles/1', {
      description: 'UTC',
      profile_type: 'user',
      profile_key: 'user1',
      profile: {
        days: [0, 1, 2, 3, 4, 5, 6],
        hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        tz: null,
      },
      rollup_daily_metrics: false,
    });
    fetchMock.postOnce('/api/time_profiles/1', data);
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsTimeProfileForm timeProfileId="1" timezones="" action="timeprofile_edit" userid="user1" />);
    });
    expect(fetchMock.called('/api/time_profiles/1')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
  it('should render editing form variant some new values', async(done) => {
    const data = {
      action: 'edit',
      description: 'UTC',
      profile_type: 'user',
      profile_key: 'admin',
      profile: {
        days: [1, 2, 3, 4, 5],
        hours: [0, 1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 19, 20, 21, 22, 23],
        tz: 'UTC',
      },
      rollup_daily_metrics: false,
    };
    fetchMock.getOnce('api/time_profiles/1', {
      description: 'UTC',
      profile_type: 'user',
      profile_key: 'admin',
      profile: {
        days: [0, 1, 2, 3, 4, 5, 6],
        hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        tz: null,
      },
      rollup_daily_metrics: false,
    });
    fetchMock.postOnce('/api/time_profiles/1', data);
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsTimeProfileForm timeProfileId="1" timezones="" action="timeprofile_edit" userid="admin" />);
    });
    expect(fetchMock.called('/api/time_profiles/1')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
  it('should render copying form variant new name only', async(done) => {
    const data = {
      action: 'create',
      description: 'UTC_Copy',
      profile_type: 'user',
      profile_key: 'admin',
      profile: {
        days: [0, 1, 2, 3, 4, 5, 6],
        hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        tz: null,
      },
      rollup_daily_metrics: false,
    };
    fetchMock.getOnce('api/time_profiles/1', {
      action: 'create',
      description: 'UTC_Copy',
      profile_type: 'user',
      profile_key: 'admin',
      profile: {
        days: [0, 1, 2, 3, 4, 5, 6],
        hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        tz: null,
      },
      rollup_daily_metrics: false,
    });
    fetchMock.postOnce('/api/time_profiles', data);
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsTimeProfileForm timeProfileId="1" timezones="" action="timeprofile_copy" userid="admin" />);
    });
    expect(fetchMock.called('/api/time_profiles/1')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
  it('should render copying form variant with new values', async(done) => {
    const data = {
      action: 'create',
      description: 'UTC_Copy',
      profile_type: 'global',
      profile_key: 'admin',
      profile: {
        days: [1, 2, 3],
        hours: [0, 1, 2, 13, 14, 15],
        tz: null,
      },
      rollup_daily_metrics: false,
    };
    fetchMock.getOnce('api/time_profiles/1', {
      action: 'create',
      description: 'UTC_Copy',
      profile_type: 'user',
      profile_key: 'admin',
      profile: {
        days: [0, 1, 2, 3, 4, 5, 6],
        hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        tz: null,
      },
      rollup_daily_metrics: false,
    });
    fetchMock.postOnce('/api/time_profiles', data);
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsTimeProfileForm timeProfileId="1" timezones="" action="timeprofile_copy" userid="admin" />);
    });
    expect(fetchMock.called('/api/time_profiles/1')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
