import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow, mount } from 'enzyme';
import AnsiblePlaybookWorkflow from '../../components/ansible-playbook-workflow';
import { ansiblePlaybookData } from './ansible-playbook-workflow.data';
import NotificationMessage from '../../components/notification-message';

describe('AnsiblePlaybookWorkflow component', () => {
  it('should render the AnsiblePlaybookWorkflow with payload', () => {
    const wrapper = shallow(<AnsiblePlaybookWorkflow
      payload={ansiblePlaybookData.payload}
      payloadType={ansiblePlaybookData.payloadType}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render the AnsiblePlaybookWorkflow without payload and display a notification', () => {
    const wrapper = mount(<AnsiblePlaybookWorkflow
      payload={undefined}
      payloadType={ansiblePlaybookData.payloadType}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find(NotificationMessage)).toHaveLength(1);
  });
});
