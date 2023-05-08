import React, { useEffect, useState, useRef } from 'react';
import {
  Tag, Loading, Link,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import { workflowStatusData, workflowStateTypes } from './data';
import MiqDataTable from '../miq-data-table';
import NotificationMessage from '../notification-message';

/** Component to render the Workflow status in /miq_request/show/#{id} page */
const RequestWorkflowStatusItem = ({ recordId }) => {
  const RELOAD = 2000; // Time interval to reload the RequestWorkflowStatus component.
  const reloadLimit = 5; // This is to handle the Auto refresh issue causing the the server to burn out with multiple requests.
  const reloadCount = useRef(0);

  const [data, setData] = useState(
    {
      isLoading: true,
      responseData: undefined,
      message: undefined,
      list: [],
      parentName: undefined,
      validType: false,
    }
  );

  /** Function to get the Workflow */
  const getWorkflow = async() => {
    reloadCount.current += 1;
    const url = `/api/configuration_scripts/${recordId}`;
    API.get(url, { skipErrors: [404, 400, 500] })
      .then((response) => {
        const responseData = workflowStatusData(response);
        if (responseData) {
          API.get(`/api/configuration_script_payloads/${responseData.parentId}`).then((response2) => {
            if (response.context) {
              setData({
                ...data,
                responseData,
                isLoading: false,
                parentName: response2.name,
                validType: true,
                message: responseData && responseData.status === workflowStateTypes.error.text ? __('Error message goes here') : undefined,
              });
            } else {
              setData({
                ...data,
                responseData,
                isLoading: false,
                parentName: response2.name,
                validType: true,
                message: sprintf(__('Context is not available for "%s"'), response.name),
              });
            }
          });
        } else {
          setData({
            ...data,
            validType: false,
            responseData: undefined,
            isLoading: false,
          });
        }
      });
  };

  /** Logic to reload the component every (RELOAD) 5 seconds. */
  useEffect(() => {
    const omitStatus = [workflowStateTypes.success.text, workflowStateTypes.error.text];
    if (reloadCount.current <= reloadLimit && data.responseData && data.responseData.status && !omitStatus.includes(data.responseData.status)) {
      const interval = setInterval(() => {
        setData({ ...data, isLoading: true });
        getWorkflow();
      }, RELOAD);
      return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }
    return undefined;
  }, [data.responseData]);

  useEffect(() => {
    if (recordId) {
      getWorkflow();
    }
  }, [recordId]);

  /** Function to render the status of workflow. */
  const renderStatusTag = () => {
    const status = workflowStateTypes[data.responseData.status];
    return (
      <Tag type={status.tagType} title={status.text}>
        {status.text.toUpperCase()}
      </Tag>
    );
  };

  /** Function to render the status of workflow status. */
  const renderWorkflowStatus = () => (
    <div className="workflow-status-container">
      <div className="workflow-status-tag">
        {data.responseData && data.responseData.status && renderStatusTag()}
      </div>
      <div className="workflow-status-label">
        <Link href={`/workflow/show/${data.responseData.parentId}/`}>{data.parentName.toString()}</Link>
      </div>
      <div className="workflow-status-action">
        {data.isLoading && <Loading active small withOverlay={false} className="loading" />}
      </div>
    </div>
  );

  /** Function to render the notification. */
  const renderNotitication = () => (
    <div className="workflow-notification-container">
      <NotificationMessage type="error" message={data.message} />
    </div>
  );

  /** Function to render the list. */
  const renderList = ({ headers, rows }) => (
    <MiqDataTable
      headers={headers}
      rows={rows}
      mode="request-workflow-status"
    />
  );

  return (
    <>
      {
        data.validType && (
          <div className="workflow-states-container">
            {data.responseData && renderWorkflowStatus()}
            {data.message && renderNotitication()}
            {data.responseData && data.responseData.status && renderList(data.responseData)}
          </div>
        )
      }
    </>
  );
};

RequestWorkflowStatusItem.propTypes = {
  recordId: PropTypes.number.isRequired,
};

export default RequestWorkflowStatusItem;
