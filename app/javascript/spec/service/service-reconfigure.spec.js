import React from 'react';
import { act } from 'react-dom/test-utils';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import {
  TextInput, TextArea, Checkbox, Dropdown, FilterableMultiSelect, RadioButtonGroup, DatePicker,
} from 'carbon-components-react';
import Service from '../../components/service';
import { mount } from 'enzyme';
import { ServiceType } from '../../components/service/constants';
import { serviceDialogResponse } from './data';
import ServiceButtons from '../../components/service/ServiceButtons';

describe('Service component - Service Reconfigure', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should render the Service component for serviceReconfigure that renders all fields', async() => {
    // Mock the service ID
    const serviceId = 123;
    
    // Setup initial data for reconfigure workflow
    const initialData = {
      dialogId: 118,
      params: {
        resourceActionId: 8732,
        targetId: serviceId,
        targetType: 'service',
      },
      urls: {
        apiSubmitEndpoint: `/api/services/${serviceId}`,
        apiAction: 'reconfigure',
        cancelEndPoint: '/service/show_list',
        finishSubmitEndpoint: '/miq_request/show_list?typ=service/',
        openUrl: false,
      },
    };
    
    const serviceType = ServiceType.reconfigure;

    // Mock the API response for reconfigure dialog
    const reconfigureDialogResponse = {
      id: serviceId,
      reconfigure_dialog: serviceDialogResponse,
    };

    // Mock the API call to fetch reconfigure dialog
    fetchMock.getOnce(`/api/services/${serviceId}?attributes=reconfigure_dialog`, {
      body: reconfigureDialogResponse,
      headers: { 'content-type': 'application/json' },
    });

    let wrapper;
    await act(async() => {
      wrapper = mount(<Service initialData={initialData} serviceType={serviceType} />);
    });

    wrapper.update();
    
    // Verify the component renders correctly
    expect(wrapper.find('.service-container')).toHaveLength(1);
    expect(wrapper.find('.service-container').hasClass('serviceReconfigure')).toBe(true);
    
    // Verify all field types are rendered
    expect(wrapper.find(TextInput)).toHaveLength(1);
    expect(wrapper.find(TextArea)).toHaveLength(1);
    expect(wrapper.find(Checkbox)).toHaveLength(1);
    expect(wrapper.find(Dropdown)).toHaveLength(1);
    expect(wrapper.find(FilterableMultiSelect)).toHaveLength(2);
    expect(wrapper.find(RadioButtonGroup)).toHaveLength(1);
    expect(wrapper.find(DatePicker)).toHaveLength(1);
    
    // Verify buttons are rendered
    expect(wrapper.find(ServiceButtons)).toHaveLength(1);
    
    // Verify the snapshot
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should handle field changes and submit reconfigure request', async() => {
    const serviceId = 123;
    
    const initialData = {
      dialogId: 118,
      params: {
        resourceActionId: 8732,
        targetId: serviceId,
        targetType: 'service',
      },
      urls: {
        apiSubmitEndpoint: `/api/services/${serviceId}`,
        apiAction: 'reconfigure',
        cancelEndPoint: '/service/show_list',
        finishSubmitEndpoint: '/miq_request/show_list?typ=service/',
        openUrl: false,
      },
    };
    
    const serviceType = ServiceType.reconfigure;

    // Create a modified version of the dialog response with one field marked as reconfigurable
    const reconfigurableDialog = JSON.parse(JSON.stringify(serviceDialogResponse));
    reconfigurableDialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[0].reconfigurable = true;
    
    const reconfigureDialogResponse = {
      id: serviceId,
      reconfigure_dialog: reconfigurableDialog,
    };

    // Mock the API call to fetch reconfigure dialog
    fetchMock.getOnce(`/api/services/${serviceId}?attributes=reconfigure_dialog`, {
      body: reconfigureDialogResponse,
      headers: { 'content-type': 'application/json' },
    });

    // Mock the API call for form submission - this is the key fix
    // We need to use .post() instead of .postOnce() to ensure it's properly registered
    fetchMock.post(`/api/services/${serviceId}`, {
      body: { success: true },
      headers: { 'content-type': 'application/json' },
    });

    // Mock redirect function
    window.miqRedirectBack = jest.fn();
    window.miqSparkleOn = jest.fn();
    window.miqSparkleOff = jest.fn();

    let wrapper;
    await act(async() => {
      wrapper = mount(<Service initialData={initialData} serviceType={serviceType} />);
    });

    wrapper.update();

    // Find the reconfigurable text field and change its value
    const textField = wrapper.find(TextInput).first();
    expect(textField.exists()).toBe(true);
    
    await act(async() => {
      textField.props().onChange({ target: { value: 'New Value' } });
    });
    
    wrapper.update();

    // Find and click the submit button
    const submitButton = wrapper.find('button').first();
    expect(submitButton.exists()).toBe(true);
    
    await act(async() => {
      submitButton.simulate('click');
    });
    
    // Need to wait for the async submission to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    wrapper.update();

    // Verify the API was called with the correct parameters
    expect(fetchMock.called(`/api/services/${serviceId}`)).toBe(true);
    
    const lastCall = fetchMock.lastCall(`/api/services/${serviceId}`);
    expect(lastCall[1].body).toContain('reconfigure');
    
    // Verify redirect was called
    expect(window.miqRedirectBack).toHaveBeenCalledWith(
      'Reconfigure Request was Submitted',
      'success',
      '/miq_request/show_list?typ=service/'
    );
  });

  it('should respect read_only fields in reconfigure mode', async() => {
    const serviceId = 123;
    
    const initialData = {
      dialogId: 118,
      params: {
        resourceActionId: 8732,
        targetId: serviceId,
        targetType: 'service',
      },
      urls: {
        apiSubmitEndpoint: `/api/services/${serviceId}`,
        apiAction: 'reconfigure',
        cancelEndPoint: '/service/show_list',
        finishSubmitEndpoint: '/miq_request/show_list?typ=service/',
        openUrl: false,
      },
    };
    
    const serviceType = ServiceType.reconfigure;

    // Create a modified version of the dialog response with read_only fields
    const reconfigurableDialog = JSON.parse(JSON.stringify(serviceDialogResponse));
    // First field is reconfigurable (not read-only)
    reconfigurableDialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[0].read_only = false;
    reconfigurableDialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[0].reconfigurable = true;
    // Second field is read-only
    reconfigurableDialog[0].dialog_tabs[0].dialog_groups[0].dialog_fields[1].read_only = true;
    
    const reconfigureDialogResponse = {
      id: serviceId,
      reconfigure_dialog: reconfigurableDialog,
    };

    // Mock the API call to fetch reconfigure dialog
    fetchMock.getOnce(`/api/services/${serviceId}?attributes=reconfigure_dialog`, {
      body: reconfigureDialogResponse,
      headers: { 'content-type': 'application/json' },
    });

    let wrapper;
    await act(async() => {
      wrapper = mount(<Service initialData={initialData} serviceType={serviceType} />);
    });

    wrapper.update();

    // Find the editable field and verify it's not read-only
    const editableField = wrapper.find(TextInput).first();
    expect(editableField.props().readOnly).toBe(false);
    
    // Find the read-only field and verify it's read-only
    const readOnlyField = wrapper.find(TextArea).first();
    expect(readOnlyField.props().readOnly).toBe(true);
  });
});
