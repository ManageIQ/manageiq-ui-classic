import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';

import { mount } from '../helpers/mountForm';
import SettingsUsersForm from '../../components/settings-users-form';

describe('SettingsUsersForm Component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  it('should render a new SettingsUsersForm form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsUsersForm recordId="new" />);
    });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render edit SettingsUsersForm', async(done) => {
    fetchMock.getOnce('/api/groups?expand=resources/', {});
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsUsersForm recordId="100" />);
    });
    expect(fetchMock.calls()).toHaveLength(1);
    expect(fetchMock.called('/api/groups?expand=resources/100')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
