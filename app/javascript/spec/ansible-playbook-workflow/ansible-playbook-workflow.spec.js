import React from 'react';
import { render } from '@testing-library/react';
import AnsiblePlaybookWorkflow from '../../components/ansible-playbook-workflow';
import { ansiblePlaybookData } from './ansible-playbook-workflow.data';

describe('AnsiblePlaybookWorkflow component', () => {
  it('should render the AnsiblePlaybookWorkflow with payload', () => {
    const { container } = render(<AnsiblePlaybookWorkflow payload={ansiblePlaybookData.payload} payloadType={ansiblePlaybookData.payloadType} />);
    expect(container).toMatchSnapshot();
  });

  it('should render the AnsiblePlaybookWorkflow without payload and display a notification', () => {
    const { container } = render(<AnsiblePlaybookWorkflow payload={undefined} payloadType={ansiblePlaybookData.payloadType} />);
    expect(container).toMatchSnapshot();
    expect(container.querySelector('.miq-notification-message-container')).toBeInTheDocument();
  });
});
