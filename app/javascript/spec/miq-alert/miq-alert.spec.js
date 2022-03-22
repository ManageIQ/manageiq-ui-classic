import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import MiqStructuredList from '../../components/miq-structured-list';
import {
  infoData, expressionData, parameterData, smsData, variableData, timelineData, managementData, alertProfileData, alertReferencedData,
} from './miq-alert.data';

describe('MiqAlertStructuredList', () => {
  it('should render alert info structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={infoData.items}
      title={infoData.title}
      mode={infoData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert expression structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={expressionData.items}
      title={expressionData.title}
      mode={expressionData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert parameter structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={parameterData.items}
      title={parameterData.title}
      mode={parameterData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert sms structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={smsData.items}
      title={smsData.title}
      mode={smsData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert variable structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={variableData.items}
      title={variableData.title}
      mode={variableData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert timeline event structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={timelineData.items}
      title={timelineData.title}
      mode={timelineData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert management event structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={managementData.items}
      title={managementData.title}
      mode={managementData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert profile structured list', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={alertProfileData.items}
      title={alertProfileData.title}
      mode={alertProfileData.mode}
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render alert referenced structured list', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={alertReferencedData.items}
      title={alertReferencedData.title}
      mode={alertReferencedData.mode}
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
