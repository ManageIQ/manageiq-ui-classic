import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AutomationSimulation from '../../components/AutomationSimulation';
import {
  objectData, treeData, xmlData, notice,
} from './automation-simulation.data';

ManageIQ.redux.addReducer = ManageIQ.redux.store.injectReducers;

// Mock jQuery xmlDisplay plugin - extend existing jQuery from jest setup
$.fn.xmlDisplay = jest.fn();

describe('AutomationSimulation Component', () => {
  const mockStore = configureStore();
  const store = mockStore({});

  const sampleData = {
    tab1: { text: __('Tree View'), rows: treeData },
    tab2: { text: __('Object Info'), rows: objectData },
    tab3: { text: __('Xml View'), rows: xmlData },
  };

  const renderWithStore = (component) => render(<Provider store={store}>{component}</Provider>);

  it('renders component without crashing', () => {
    const { container } = renderWithStore(<AutomationSimulation data={sampleData} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders notification message when notice is present', () => {
    const { container } = renderWithStore(<AutomationSimulation data={notice} />);
    expect(container.querySelector('.miq-notification-message-container')).toBeInTheDocument();
  });

  it('renders tabs and tab contents correctly', () => {
    const { container } = renderWithStore(<AutomationSimulation data={sampleData} />);
    expect(container).toMatchSnapshot();
  });

  it('renders component with tabs correctly', () => {
    const { container } = renderWithStore(<AutomationSimulation data={sampleData} />);

    expect(container.querySelector('.automation_simulation_tab')).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(3);
    expect(tabs[0]).toHaveTextContent(__('Tree View'));
    expect(tabs[1]).toHaveTextContent(__('Object Info'));
    expect(tabs[2]).toHaveTextContent(__('Xml View'));
  });

  it('renders tab contents correctly based on data', () => {
    const { container } = renderWithStore(<AutomationSimulation data={sampleData} />);
    const structuredLists = container.querySelectorAll('.miq-structured-list');
    expect(structuredLists.length).toBe(3);
    expect(container.querySelector('.miq-notification-message-container')).not.toBeInTheDocument();
  });
});
