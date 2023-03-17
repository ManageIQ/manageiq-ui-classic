import React, { useState, useEffect } from 'react';
import { Loading } from 'carbon-components-react';
import MiqDataTable from '../miq-data-table';
import { workflowsList } from './workflows-dummy-data';

const WorkflowList = () => {
  const [data, setData] = useState({ isLoading: true, list: {} });

  // TODO: Change the url when the GET automated worflow list api is available.
  useEffect(() => {
    API.get('/api/workflows/?expand=resources')
      .then((response) => {
        setData({
          isLoading: false,
          list: workflowsList(response),
        });
      });
  }, []);

  /** Function to handle a row's click event. */
  const onSelect = (selectedItemId) => {
    miqSparkleOn();
    window.location.href = `/workflow/show/${selectedItemId}`;
  };
  if (data.isLoading) {
    return (
      <div className="loadingSpinner">
        <Loading active small withOverlay={false} className="loading" />
      </div>
    );
  }

  return (
    <MiqDataTable
      headers={data.list.headers}
      rows={data.list.rows}
      onCellClick={(selectedRow) => onSelect(selectedRow.id)}
      showPagination={false}
      truncateText={false}
      mode="automated-workflow-list"
      gridChecks={[]}
    />
  );
};

export default WorkflowList;
