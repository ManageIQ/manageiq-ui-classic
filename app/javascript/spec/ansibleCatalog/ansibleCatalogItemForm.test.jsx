import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PropTypes from 'prop-types';
import fetchMock from 'fetch-mock';
import { reduxStore, sampleForm } from './test.fixtures';
import { ANSIBLE_FIELDS } from '../../react/ansibleCatalog/constants';
import AnsibleCatalogItemForm from '../../react/ansibleCatalog';
import { AnsibleCatalogItemForm as AnsibleCatalogItemForm1 } from '../../react/ansibleCatalog/ansibleCatalogItemForm';


describe('Ansible catalog item form component', () => {
  const mockStore = configureStore([thunk]);

  let store;
  let initialProps;
  const shallowMount = () => shallow(
    <AnsibleCatalogItemForm {...initialProps} />,
    {
      context: { store },
      childContextTypes: { store: PropTypes.object.isRequired },
    },
  ).dive();

  beforeEach(() => {
    store = mockStore({
      ansibleCatalog: {
        ...reduxStore,
      },
    });
    initialProps = {
      loadCatalogs: jest.fn(),
      loadDialogs: jest.fn(),
      loadRepos: jest.fn(),
      loadCatalogItem: jest.fn(),
      loadPlaybooks: jest.fn(),
      loadCredentials: jest.fn(),
      loadCloudTypes: jest.fn(),
      loadCloudCredential: jest.fn(),
      duplicateDropdowns: jest.fn(),
      region: 10,
    };
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  it('should render correctly', () => {
    const wrapper = shallowMount();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should allow a catalog item to be edited', () => {
    const catalogItemId = 1234;

    const loadCatalogItem = jest.fn(() => Promise.resolve({}));
    const loadCredential = jest.fn(() => Promise.resolve({}));
    mount(
      <AnsibleCatalogItemForm1
        {...initialProps}
        ansibleCatalog={{ ...reduxStore }}
        loadCatalogItem={loadCatalogItem}
        loadCloudCredential={loadCredential}
        catalogItemFormId={catalogItemId}
      />,
      {
        context: { store },
        childContextTypes: { store: PropTypes.object.isRequired },
      },
    );
    expect(loadCatalogItem).toHaveBeenCalledWith(1234);
  });
  it('should set default values when a catalog item is being edited', (done) => {
    const catalogItemId = 1234;

    store = mockStore({
      ansibleCatalog: {
        ...reduxStore,
      },
    });
    const loadCatalogItem = jest.fn(() => Promise.resolve({}));
    const loadCloudCredential = jest.fn(() => Promise.resolve({}));
    const loadPlaybooks = jest.fn(() => Promise.resolve({}));
    const props = {
      ...initialProps, loadCatalogItem, loadCloudCredential, loadPlaybooks,
    };
    const wrapper = mount(
      <AnsibleCatalogItemForm1
        {...props}
        ansibleCatalog={{ ...reduxStore }}
        catalogItemFormId={catalogItemId}
      />
      , {
        context: { store },
        childContextTypes: { store: PropTypes.object.isRequired },
      },
    );

    expect(loadCatalogItem).toHaveBeenCalledWith(1234);
    wrapper.update();
    setImmediate(() => {
      done();
      expect(loadCloudCredential).toHaveBeenCalledWith(123);
      const formValues = wrapper.state().initialValues;
      expect(formValues).toEqual(sampleForm);
    });
  });
  it('should allow a form to be submitted', () => {
    const wrapper = shallowMount();
    window.location.assign = jest.fn();
    fetchMock.postOnce('/api/service_templates/', {});
    const values = {
      name: 'test',
      description: '',
      long_description: '',
      service_template_catalog_id: '',
      provision_extra_vars: [],
      retirement_extra_vars: [],
    };
    wrapper.instance().submitForm(values);
    expect(fetchMock.called('/api/service_templates/')).toBe(true);
  });
  it('should report an error if submitting failed', () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const spy = jest.spyOn(window, 'add_flash');
    window.add_flash = spy;
    const wrapper = shallowMount();
    fetchMock.mock('/api/service_templates/', {
      body: '',
      status: 500,
    });
    const values = {
      name: 'test',
      description: '',
      long_description: '',
      service_template_catalog_id: '',
      provision_extra_vars: [],
      retirement_extra_vars: [],
    };
    wrapper.instance().submitForm(values);
    wrapper.update();
    setImmediate(() => {
      expect(spy).toHaveBeenCalledWith('Catalog item failed to be added. ', 'error');
    });
  });
  it('should close a popup', () => {
    const wrapper = shallowMount();
    const instance = wrapper.instance();
    instance.setState({ showCopyProvisionDialog: true });
    instance.closeCopyProvisionDialog();
    expect(wrapper.state.showCopyProvisionDialog).toBeFalsy();
  });
  it('should show a message when canceling form', () => {
    const wrapper = shallowMount();
    const instance = wrapper.instance();
    const flashMessage = jest.fn();
    global.miqFlashLater = flashMessage;
    instance.handleCancel();
    expect(flashMessage).toHaveBeenCalledWith({
      message: 'Add of Catalog Item was cancelled by the user',
    });
  });
  it('should copy Form values', () => {
    const wrapper = shallowMount();
    const instance = wrapper.instance();
    const changeValue = jest.fn();
    const utils = {
      changeValue,
    };
    const formState = {
      formState:
      {
        values: sampleForm,
      },
    };
    instance.copyFormValues(null, formState, utils);
    expect(changeValue).toHaveBeenCalledTimes(ANSIBLE_FIELDS.length);
  });
});
