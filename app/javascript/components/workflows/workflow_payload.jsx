import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Loading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@carbon/react';
import AWSSfnGraph from '@tshepomgaga/aws-sfn-graph';
import { Controlled as CodeMirror } from 'react-codemirror2';
import '@tshepomgaga/aws-sfn-graph/index.css';

const WorkflowPayload = ({ recordId }) => {
  const tabLabels = [
    { name: 'text', text: __('Text') },
    { name: 'graph', text: __('Graph') },
  ];

  /** Function to get the mode for code mirror. */
  const mode = (type) => {
    if (type === 'json') {
      return { name: 'javascript', json: true };
    }
    return type;
  };

  const [data, setData] = useState({
    isLoading: true,
    payload: '',
    payloadType: mode('json'),
    activeTab: tabLabels[0].name,
  });

  useEffect(() => {
    API.get(`/api/configuration_script_payloads/${recordId}?expand=resources`)
      .then((response) => {
        setData((currentState) => ({
          ...currentState,
          isLoading: false,
          payload: response.payload,
          payloadType: mode(response.payload_type),
        }));
      });
  }, [recordId]);

  if (data.isLoading) {
    return (
      <div className="loadingSpinner">
        <Loading active small withOverlay={false} className="loading" />
      </div>
    );
  }

  /** Function to set the active tab name */
  const onTabSelect = (name) => {
    setData({
      ...data,
      activeTab: name,
    });
  };

  /** Function to render the code mirror component */
  const error = false;
  const renderCodeSnippet = () => (
    <CodeMirror
      className={`miq-codemirror workflow-payload ${error ? 'has-error' : ''}`}
      options={{
        mode: data.payloadType,
        theme: 'eclipse',
        lint: true,
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        gutters: ['CodeMirror-lint-markers'],
      }}
      value={data.payload}
    />
  );

  return (
    <Tabs>
      <TabList aria-label="Workflow Payload Tabs" className="miq_custom_tabs">
        {tabLabels.map(({ name, text }) => (
          <Tab key={`tab${name}`} onClick={() => onTabSelect(name)}>
            {text}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        <TabPanel key="panel-text">{renderCodeSnippet()}</TabPanel>
        <TabPanel
          key="panel-graph"
          className="miq-workflow-payload-graph-tab-panel"
        >
          {data.activeTab === tabLabels[1].name && (
            <AWSSfnGraph
              data={data.payload}
              width={500}
              height={500}
              onError={(error) => console.log('error information', error)}
            />
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

WorkflowPayload.propTypes = {
  recordId: PropTypes.string.isRequired,
};

export default WorkflowPayload;
