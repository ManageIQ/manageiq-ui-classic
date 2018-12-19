import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PropTypes from 'prop-types';
import { reduxStore } from './test.fixtures';

import ConnectedAnsiblePlaybookFields, { AnsiblePlaybookFields } from '../../react/ansibleCatalog/ansiblePlaybookFields';

describe('Ansible playbook fields form component', () => {
  const mockStore = configureStore([thunk]);
  let store;
  let initialProps;

  beforeEach(() => {
    store = mockStore({
    });
    initialProps = {

      loadRepos: jest.fn(),
      loadCatalogItem: jest.fn(),
      loadPlaybooks: jest.fn(),
      loadCloudTypes: jest.fn(),
      loadCloudCredential: jest.fn(),
      duplicateDropdowns: jest.fn(),
      formValues: {
        provision_extra_vars: [
        ],
        provision_repository_id: 1234,
      },
      changeField: jest.fn(),
      addExtraVars: jest.fn(),
      prefix: 'provision',
      region: 1,
    };
  });

  it('should render correctly', () => {
    const exampleStore = { ...reduxStore };
    exampleStore.dropdowns.provision_playbooks = [
      { label: 'test', value: 'test' },
    ];
    exampleStore.dropdowns.provision_cloudTypes = [
      { label: 'test', value: 'test' },
    ];
    store = mockStore({
      ansibleCatalog: {
        ...exampleStore,
      },
    });
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const wrapper = shallow(
      <ConnectedAnsiblePlaybookFields {...initialProps} />,
      {
        context: { store },
        childContextTypes: { store: PropTypes.object.isRequired },
      },
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should update a list of playbooks', () => {
    store = mockStore({
      ansibleCatalog: {
        ...reduxStore,
      },
    });
    const loadPlaybooks = jest.fn(() => Promise.resolve({}));
    const wrapper = shallow(<AnsiblePlaybookFields
      {...initialProps}
      data={{ ...reduxStore }}
      loadPlaybooks={loadPlaybooks}
    />);

    wrapper.instance().updatePlaybookList();
    expect(loadPlaybooks).toHaveBeenCalledWith(1, 1234, 'provision');
  });

  it('should update cloud credentials', () => {
    store = mockStore({
      ansibleCatalog: {
        ...reduxStore,
      },
    });
    const loadCloudCredentials = jest.fn(() => Promise.resolve({}));
    const wrapper = shallow(<AnsiblePlaybookFields
      {...initialProps}
      data={{ ...reduxStore }}
      loadCloudCredentials={loadCloudCredentials}
    />);

    wrapper.instance().updateCloudCredentialsList('amazon');
    expect(loadCloudCredentials).toHaveBeenCalledWith('provision', 'amazon');
  });

  it('should detect if field values are prepopulated', () => {
    const exampleStore = { ...reduxStore };
    initialProps.formValues.provision_cloud_type = 'test';

    const loadCloudCredentials = jest.fn(() => Promise.resolve({}));
    const loadPlaybooks = jest.fn(() => Promise.resolve({}));
    store = mockStore({
      ansibleCatalog: {
        ...exampleStore,
      },
    });
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    mount(
      <AnsiblePlaybookFields
        {...initialProps}
        data={{ ...reduxStore }}
        loadCloudCredentials={loadCloudCredentials}
        loadPlaybooks={loadPlaybooks}
      />,
      {
        context: { store },
        childContextTypes: { store: PropTypes.object.isRequired },
      },
    );
    expect(loadCloudCredentials).toHaveBeenCalled();
    expect(loadPlaybooks).toHaveBeenCalled();
  });
});
