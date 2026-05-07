import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MiqCustomTab from '../../components/miq-custom-tab';

let store;

describe('MiqCustomTab component', () => {
  beforeEach(() => {
    store = configureStore()({
      miqCustomTabReducer: 0,
    });
  });

  const reduxMount = (component) =>
    render(<Provider store={store}>{component}</Provider>);

  // Helper to map label keys to their displayed text
  const catalogLabels = {
    basic: 'Basic Information',
    detail: 'Details',
    resource: 'Selected Resources',
  };

  const requestInfoLabels = {
    requester: 'Requester',
    purpose: 'Purpose',
    service: 'Catalog',
    environment: 'Environment',
    hardware: 'Properties',
    customize: 'Customize',
    schedule: 'Schedule',
  };

  it('should render tabs for catalog summary page', () => {
    const tabLabels = Object.keys(catalogLabels);
    const { container } = reduxMount(
      <MiqCustomTab
        containerId="catalog-tabs"
        tabLabels={tabLabels}
        type="CATALOG_SUMMARY"
      />
    );

    expect(
      container.querySelector('#catalog_summary_static')
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    tabLabels.forEach((label) => {
      expect(screen.getByText(catalogLabels[label])).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render tabs for request info page under catalog summary page', () => {
    const tabLabels = Object.keys(requestInfoLabels);
    const { container } = reduxMount(
      <MiqCustomTab
        containerId="request-info-tabs"
        tabLabels={tabLabels}
        type="CATALOG_REQUEST_INFO"
      />
    );

    expect(
      container.querySelector('#catalog_request_info_dynamic')
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    tabLabels.forEach((label) => {
      expect(screen.getByText(requestInfoLabels[label])).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render tabs for catalog edit page', () => {
    const tabLabels = Object.keys(catalogLabels);
    const { container } = reduxMount(
      <MiqCustomTab
        containerId="catalog-edit-tabs"
        tabLabels={tabLabels}
        type="CATALOG_EDIT"
      />
    );

    expect(container.querySelector('#catalog_edit_static')).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    tabLabels.forEach((label) => {
      expect(screen.getByText(catalogLabels[label])).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
