import React from 'react';
import { act } from 'react-dom/test-utils';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import {
  TextInput, TextArea, Checkbox, Dropdown, FilterableMultiSelect, RadioButtonGroup, DatePicker,
} from 'carbon-components-react';
import Service from '../../components/service';
import { mount } from '../helpers/mountForm';
import { ServiceType } from '../../components/service/constants';
import { serviceDialogResponse } from './data';
import ServiceButtons from '../../components/service/ServiceButtons';

describe('Service component - Order Service', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should render the Service component for orderServiceForm that renders all fields', async() => {
    const initialData = {
      dialogId: 118,
      params: {
        resourceActionId: 8732,
        targetId: 170,
        targetType: 'service_template',
        realTargetType: 'ServiceTemplate',
      },
      urls: {
        apiSubmitEndpoint: '/api/service_catalogs/7/service_templates/170',
        apiAction: 'order',
        cancelEndPoint: '/catalog/explorer',
        finishSubmitEndpoint: '/miq_request/show_list',
        openUrl: false,
      },
      requestDialogOptions: undefined,
    };
    const serviceType = ServiceType.order;
    const { resourceActionId, targetId, targetType } = initialData.params;
    const attributes = `?resource_action_id=${resourceActionId}&target_id=${targetId}&target_type=${targetType}`;

    fetchMock.getOnce(`/api/service_dialogs/${initialData.dialogId}${attributes}`, {
      body: {
        content: serviceDialogResponse,
      },
      headers: { 'content-type': 'application/json' },
    });

    let wrapper;
    await act(async() => {
      wrapper = mount(<Service initialData={initialData} serviceType={serviceType} />);
    });

    wrapper.update();
    expect(wrapper.find('.service-container')).toHaveLength(1);
    expect(wrapper.find('.refresh-field-item button')).toHaveLength(1);
    expect(wrapper.find(TextInput)).toHaveLength(1);
    expect(wrapper.find(TextArea)).toHaveLength(1);
    expect(wrapper.find(Checkbox)).toHaveLength(1);
    expect(wrapper.find(Dropdown)).toHaveLength(1);
    expect(wrapper.find(FilterableMultiSelect)).toHaveLength(2);
    expect(wrapper.find(RadioButtonGroup)).toHaveLength(1);
    expect(wrapper.find(DatePicker)).toHaveLength(1);
    expect(wrapper.find(ServiceButtons)).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
