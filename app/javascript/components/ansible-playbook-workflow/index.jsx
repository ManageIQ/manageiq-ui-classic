import React from 'react';
import PropTypes from 'prop-types';
import { Controlled as CodeMirror } from 'react-codemirror2';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@carbon/react';
import NotificationMessage from '../notification-message';

/** The AnsiblePlaybookWorkflow is used to render the payload received from the  Ansible Playbook's show page */
const AnsiblePlaybookWorkflow = ({ payload, payloadType }) => {
  /** Function to render a notification message. */
  const renderMessage = () => <NotificationMessage type="info" message={__('Payload is not available.')} />;

  /** Function to render the payload using  CodeMirror. */
  const renderCodeMirror = () => (
    <CodeMirror
      className="miq-codemirror ansible-playbook-workflow-payload"
      options={{
        mode: payloadType,
        theme: 'eclipse',
        lint: true,
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        gutters: ['CodeMirror-lint-markers'],
      }}
      value={payload}
    />
  );

  /** Function to render the tab contents. Only one tab named 'Text' is required for ansible. */
  const renderTabContents = () => (
    <Tabs>
      <TabList aria-label="Ansible Playbook Tabs" className="miq_custom_tabs">
        <Tab>{__('Text')}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {renderCodeMirror()}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );

  return (
    <div className="row">
      <div className="col-md-12 col-lg-6">
        {
          payload ? renderTabContents() : renderMessage()
        }
      </div>
    </div>
  );
};

AnsiblePlaybookWorkflow.propTypes = {
  payload: PropTypes.string,
  payloadType: PropTypes.string.isRequired,
};

AnsiblePlaybookWorkflow.defaultProps = {
  payload: undefined,
};

export default AnsiblePlaybookWorkflow;
