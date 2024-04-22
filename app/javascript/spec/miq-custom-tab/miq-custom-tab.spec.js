import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MiqCustomTab from '../../components/miq-custom-tab';

let store;

describe('MiqCustomTab component', () => {
  store = configureStore()({
    miqCustomTabReducer: 0,
  });

  const reduxMount = (data) => {
    const Component = () => data;

    return mount(
      <Provider store={store}>
        <Component />
      </Provider>
    );
  };

  it('should render tabs for catalog summary page', () => {
    const tabLabels = ['basic', 'detail', 'resource'];
    const wrapper = reduxMount(<MiqCustomTab
      containerId="catalog-tabs"
      tabLabels={tabLabels}
      type="CATALOG_SUMMARY"
    />);
    // expect(wrapper.find('#catalog_summary_static')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render tabs for request info page under catalog summary page', () => {
    const tabLabels = ['requester', 'purpose', 'service', 'environment', 'hardware', 'customize', 'schedule'];
    const wrapper = reduxMount(<MiqCustomTab
      containerId="request-info-tabs"
      tabLabels={tabLabels}
      type="CATALOG_REQUEST_INFO"
    />);
    // expect(wrapper.find('#catalog_request_info_dynamic')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render tabs for catalog edit page', () => {
    const tabLabels = ['basic', 'detail', 'resource'];
    const wrapper = reduxMount(<MiqCustomTab
      containerId="catalog-edit-tabs"
      tabLabels={tabLabels}
      type="CATALOG_EDIT"
    />);
    // expect(wrapper.find('#catalog_edit_static')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
