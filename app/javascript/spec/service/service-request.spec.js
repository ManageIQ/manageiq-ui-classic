import React from 'react';
import { act } from 'react-dom/test-utils';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import {
  TextInput, TextArea, Checkbox, RadioButtonGroup,
} from 'carbon-components-react';
import Service from '../../components/service';
import { mount } from '../helpers/mountForm';
import { ServiceType } from '../../components/service/constants';
import { serviceDialogResponse } from './data';
import ServiceButtons from '../../components/service/ServiceButtons';

describe('Service component - Service Request', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should render the Service component for serviceRequest that renders all fields', async() => {
    const initialData = {
      dialogId: 118,
      requestDialogOptions: {
        dialog_text_box_1: 0,
        dialog_textarea_box_1: 'AAA',
        dialog_check_box_1: 't',
        dialog_dropdown_list_1: '16',
        dialog_dropdown_list_2_1: [
          {
            label: '3',
            value: '3',
          },
          {
            label: '2',
            value: '2',
          },
        ],
        dialog_radio_button_1: '2',
        dialog_date_control_1: '2024-07-11',
        dialog_date_time_control_1: '2024-07-11T15:26:00Z',
        dialog_tag_control_1: [
          {
            label: 'Database',
            value: '10',
          },
          {
            label: 'DHCP Server',
            value: '11',
          },
        ],
      },
    };

    const serviceType = ServiceType.request;

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
    expect(wrapper.find(TextInput)).toHaveLength(5); // Also DropDown, Date, DateTime
    expect(wrapper.find(TextArea)).toHaveLength(1);
    expect(wrapper.find(Checkbox)).toHaveLength(1);
    expect(wrapper.find(RadioButtonGroup)).toHaveLength(1);
    expect(wrapper.find(ServiceButtons)).toHaveLength(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
