import React from 'react';
import fetchMock from 'fetch-mock';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SettingsReplicationForm from '../../components/settings-replication-form';

describe('SettingsReplicationForm Form Component', () => {
  const mockStore = configureStore();
  const store = mockStore({});

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  const replicationMockData = {
    replication_type: 'none',
    subscriptions: [],
  };

  it('should render SettingsReplicationForm correctly', async() => {
    const wrapper = shallow(<SettingsReplicationForm
      pglogicalReplicationFormId="new"
    />);

    fetchMock.get(`/ops/pglogical_subscriptions_form_fields/new`, replicationMockData);

    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });

  it('should render the replication type dropdown', async() => {
    fetchMock.get(`/ops/pglogical_subscriptions_form_fields/new`, replicationMockData);
    let wrapper;
    await act(async() => {
      wrapper = mount(
        <Provider store={store}>
          <SettingsReplicationForm pglogicalReplicationFormId="new" />
        </Provider>
      );
    });
    wrapper.update();
    expect(wrapper.find('select[name="replication_type"]').exists()).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render the subscription section when replication type is global', async() => {
    fetchMock.get(`/ops/pglogical_subscriptions_form_fields/new`, replicationMockData);
    let wrapper;
    await act(async() => {
      wrapper = mount(
        <Provider store={store}>
          <SettingsReplicationForm pglogicalReplicationFormId="new" />
        </Provider>
      );
    });
    wrapper.update();
    wrapper.find('select[name="replication_type"]').simulate('change', { target: { value: 'global' } });

    expect(wrapper.find('div#subscriptions_section').exists()).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should not render the subscription section when replication type is remote', async() => {
    fetchMock.get(`/ops/pglogical_subscriptions_form_fields/new`, replicationMockData);
    let wrapper;
    await act(async() => {
      wrapper = mount(
        <Provider store={store}>
          <SettingsReplicationForm pglogicalReplicationFormId="new" />
        </Provider>
      );
    });
    wrapper.update();
    wrapper.find('select[name="replication_type"]').simulate('change', { target: { value: 'remote' } });

    expect(wrapper.find('div#subscriptions_section').exists()).toBe(false);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('display a button for adding subscription when replication type is global', async() => {
    fetchMock.get(`/ops/pglogical_subscriptions_form_fields/new`, replicationMockData);
    let wrapper;
    await act(async() => {
      wrapper = mount(
        <Provider store={store}>
          <SettingsReplicationForm pglogicalReplicationFormId="new" />
        </Provider>
      );
    });
    wrapper.update();
    wrapper.find('select[name="replication_type"]').simulate('change', { target: { value: 'global' } });
    wrapper.update();

    expect(wrapper.find('button').filterWhere((node) => node.text() === 'Add Subscription').exists()).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should open the modal for adding subscription', async() => {
    fetchMock.get(`/ops/pglogical_subscriptions_form_fields/new`, replicationMockData);
    let wrapper;
    await act(async() => {
      wrapper = mount(
        <Provider store={store}>
          <SettingsReplicationForm pglogicalReplicationFormId="new" />
        </Provider>
      );
    });
    wrapper.update();
    // Change the replication type to "global"
    wrapper.find('select[name="replication_type"]').simulate('change', { target: { value: 'global' } });
    wrapper.update();
    // Click the "Add Subscription" button
    wrapper.find('button').filterWhere((node) => node.text() === 'Add Subscription').simulate('click');
    wrapper.update();
    // Check if the modal is open
    expect(wrapper.find('Modal').prop('open')).toBe(true);
  });
});
