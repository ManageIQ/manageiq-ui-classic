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

describe('Service component - Dialog Summary', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should render the Service component for dialogSummary that renders all fields', async() => {
    const initialData = {
      dialogId: 118,
    };
    const serviceType = ServiceType.dialog;

    fetchMock.getOnce(`/api/service_dialogs/${initialData.dialogId}`, {
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
    expect(wrapper.find(ServiceButtons)).toHaveLength(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
