import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import MiqStructuredList from '../../components/miq-structured-list';
import {
  infoData, conditionsScopeData, conditionsExpressionData, conditionPoliciesData, conditionNotes,
} from './miq-condition.data';

describe('MiqConditionStructuredList', () => {
  it('should render condition info structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={infoData.items}
      title={infoData.title}
      mode={infoData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render condition scope structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={conditionsScopeData.items}
      title={conditionsScopeData.title}
      mode={conditionsScopeData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render condition expression structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={conditionsExpressionData.items}
      title={conditionsExpressionData.title}
      mode={conditionsExpressionData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render condition policy structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={conditionPoliciesData.items}
      title={conditionPoliciesData.title}
      mode={conditionPoliciesData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render condition notes structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={conditionNotes.items}
      title={conditionNotes.title}
      mode={conditionNotes.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
