import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AutomationSimulation from '../../components/AutomationSimulation';
import {
  objectData, treeData, xmlData, notice,
} from './automation-simulation.data';

ManageIQ.redux.addReducer = ManageIQ.redux.store.injectReducers;

describe('AutomationSimulation Component', () => {
  const mockStore = configureStore();
  const store = mockStore({});

  const sampleData = {
    tab1: { text: __('Tree View'), rows: treeData },
    tab2: { text: __('Object Info'), rows: objectData },
    tab3: { text: __('Xml View'), rows: xmlData },
  };

  it('renders component without crashing', () => {
    const wrapper = shallow(<AutomationSimulation data={sampleData} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders notification message when notice is present', () => {
    const wrapper = shallow(<AutomationSimulation data={notice} />);
    expect(wrapper.find('NotificationMessage').exists()).toBe(true);
  });

  it('renders tabs and tab contents correctly', () => {
    const wrapper = shallow(<AutomationSimulation data={sampleData} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('renders component with tabs correctly', () => {
    const wrapper = mount(
      <Provider store={store}>
        <AutomationSimulation data={sampleData} />
      </Provider>
    );
    expect(wrapper.find('.automation_simulation_tab').exists()).toBe(true);
    expect(wrapper.find('.automation_simulation_tab').find('Tab').length).toBe(3);
    expect(wrapper.find('.automation_simulation_tab').find('Tab').at(0).prop('label')).toBe(__('Tree View'));
    expect(wrapper.find('.automation_simulation_tab').find('Tab').at(1).prop('label')).toBe(__('Object Info'));
    expect(wrapper.find('.automation_simulation_tab').find('Tab').at(2).prop('label')).toBe(__('Xml View'));
  });

  it('renders tab contents correctly based on data', () => {
    const wrapper = mount(
      <Provider store={store}>
        <AutomationSimulation data={sampleData} />
      </Provider>
    );
    expect(wrapper.find('MiqStructuredList').length).toBe(3);
    expect(wrapper.find('NotificationMessage').exists()).toBe(false);
  });
});
