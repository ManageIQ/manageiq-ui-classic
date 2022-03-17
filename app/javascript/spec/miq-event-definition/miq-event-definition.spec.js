import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import MiqStructuredList from '../../components/miq-structured-list';
import {
  infoData, eventDefinitionPolicyData,
} from './miq-event-definition.data';

describe('MiqEventDefinitionStructuredList', () => {
  it('should render event definition info structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={infoData.items}
      title={infoData.title}
      mode={infoData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render event definition policy structured list', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={eventDefinitionPolicyData.items}
      title={eventDefinitionPolicyData.title}
      mode={eventDefinitionPolicyData.mode}
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
