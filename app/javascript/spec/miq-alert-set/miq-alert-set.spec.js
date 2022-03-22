import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import MiqStructuredList from '../../components/miq-structured-list';
import {
  infoData, alertSetAssignedData, alertSetNotes, alertSetAlerts,
} from './miq-alert-set.data';

describe('MiqAlertSetStructuredList', () => {
  it('should render alert set info structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={infoData.items}
      title={infoData.title}
      mode={infoData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert set assigned structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={alertSetAssignedData.items}
      title={alertSetAssignedData.title}
      mode={alertSetAssignedData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert set notes structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={alertSetNotes.items}
      title={alertSetNotes.title}
      mode={alertSetNotes.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert set alerts structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={alertSetAlerts.items}
      title={alertSetAlerts.title}
      mode={alertSetAlerts.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
