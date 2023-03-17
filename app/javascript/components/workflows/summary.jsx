import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Loading, Tabs, Tab,
} from 'carbon-components-react';
import AWSSfnGraph from '@tshepomgaga/aws-sfn-graph';
import { Controlled as CodeMirror } from 'react-codemirror2';
import MiqStructuredList from '../miq-structured-list';
import { workflowData } from './workflows-dummy-data';
import '@tshepomgaga/aws-sfn-graph/index.css';

const WorkflowSummary = ({ recordId }) => {
  const tabLabels = [
    { name: 'text', text: __('Text') },
    { name: 'graph', text: __('Graph') },
  ];
  const [data, setData] = useState({
    isLoading: true,
    summary: [],
    jsonData: {},
    activeTab: tabLabels[0].name,
  });

  const onClickHandler = (data) => console.log('data=', data);

  // TODO: Change the url when the GET automated worflow summary for recordId api is available.
  useEffect(() => {
    API.get(`/api/workflows/${recordId}?expand=resources`)
      .then((response) => {
        const { summary, jsonData } = workflowData(response);
        setData({
          isLoading: false,
          summary,
          jsonData,
        });
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
      className={`miq-codemirror ${error ? 'has-error' : ''}`}
      options={{
        mode: { name: 'javascript', json: true },
        theme: 'eclipse',
        lint: true,
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        gutters: ['CodeMirror-lint-markers'],
      }}
      style={{ height: 'auto' }}
      value={JSON.stringify(data.jsonData, null, 2)}
    />
  );

  /** Function to render the graph. */
  const renderGraph = () => (
    <AWSSfnGraph
      data={data.jsonData}
      width={500}
      height={500}
      onError={(error) => console.log('error information', error)}
    />
  );

  /** Function to render various tab contents based on selected tab. */
  const renderTabContents = () => {
    switch (data.activeTab) {
      case tabLabels[0].name: return renderCodeSnippet();
      case tabLabels[1].name: return renderGraph();
      default: return renderCodeSnippet();
    }
  };

  /** Function to render the tab sections
   * TODO: This can be moved to a new component.
   */
  const renderTabsSection = () => (
    <Tabs className="miq_custom_tabs">
      {
        tabLabels.map(({ name, text }) => (
          <Tab key={`tab${name}`} label={text} onClick={() => onTabSelect(name)}>
            { renderTabContents()}
          </Tab>
        ))
      }
    </Tabs>
  );

  /** Function to render the summary */
  const renderSummarySection = () => (
    <MiqStructuredList
      title={__('Basic "information')}
      rows={data.summary}
      mode="workflow_basic_information"
      onClick={(data) => onClickHandler(data)}
    />
  );

  return (
    <>
      {renderSummarySection()}
      {renderTabsSection()}
    </>
  );
};

WorkflowSummary.propTypes = {
  recordId: PropTypes.string.isRequired,
};

export default WorkflowSummary;
