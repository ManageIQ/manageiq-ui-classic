import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import SettingsReplicationForm from '../../components/settings-replication-form';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('SettingsReplicationForm Component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render SettingsReplicationForm correctly', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsReplicationForm pglogicalReplicationFormId="new" />);
    });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });


  it('should handle form submission (POST request)', async(done) => {
    fetchMock.post('/ops/pglogical_save_subscriptions/new?button=save', { success: true });
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsReplicationForm pglogicalReplicationFormId="test-id" />);
    });
    wrapper.update();

    await act(async() => {
      wrapper.find('form').simulate('submit');
    });
    expect(fetchMock.called('/ops/pglogical_save_subscriptions/new?button=save')).toBe(true);
    done();
  });

  it('should open and close the modal', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsReplicationForm pglogicalReplicationFormId="test-id" />);
    });
    wrapper.update();

    await act(async() => {
      wrapper.find('button[aria-label="Add Subscription"]').simulate('click');
    });
    wrapper.update();
    expect(wrapper.find('Modal').prop('open')).toBe(true);
    await act(async() => {
      wrapper.find('button[aria-label="Close"]').simulate('click');
    });
    wrapper.update();
    expect(wrapper.find('Modal').prop('open')).toBe(false);
    done();
  });
});