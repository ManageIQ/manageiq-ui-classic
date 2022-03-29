import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import MiqStructuredList from '../../components/miq-structured-list';
import {
  infoData, miqPolicySetData, policySetNotesData,
} from './miq-policy-set.data';

describe('MiqPolicySetStructuredList', () => {
  it('should render policy set info structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={infoData.items}
      title={infoData.title}
      mode={infoData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render policy set structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={miqPolicySetData.items}
      title={miqPolicySetData.title}
      mode={miqPolicySetData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render policy set notes structured list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={policySetNotesData.items}
      title={policySetNotesData.title}
      mode={policySetNotesData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
