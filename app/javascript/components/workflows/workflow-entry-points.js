import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Loading } from 'carbon-components-react';
import MiqDataTable from '../miq-data-table';
import { workflowsEntryPoints, treeProps } from './workflows-dummy-data';
import { TreeViewRedux } from '../tree-view';

const WorkflowEntryPoints = ({ fieldName, entryPoint }) => {
  const [data, setData] = useState({ isLoading: true, list: {}, selectedItemId: undefined });

  // TODO: Change the url when the GET automated worflow list api is available.
  useEffect(() => {
    API.get('/api/workflows/?expand=resources')
      .then((response) => {
        setData({
          isLoading: false,
          list: workflowsEntryPoints(response),
        });
      });
  }, []);

  /** Function to handle a row's click event. */
  const onSelect = (selectedItemId) => {
    setData({
      ...data,
      selectedItemId: (data.selectedItemId === selectedItemId) ? undefined : selectedItemId,
    });
  };
  if (data.isLoading) {
    return (
      <div className="loadingSpinner">
        <Loading active small withOverlay={false} className="loading" />
      </div>
    );
  }
  const onCloseModal = () => {
    document.getElementById(entryPoint).style.display = 'none';
    document.getElementById(`${entryPoint}_modal`).style.display = 'none';
  };
  const onApply = () => {
    const seletedItem = data.list.rows.find((item) => item.id === data.selectedItemId);
    document.getElementById(fieldName).value = seletedItem.name.text;
    onCloseModal();
  };
  return (
    <>
      {/* <TreeViewRedux {...treeProps} /> */}
      <MiqDataTable
        headers={data.list.headers}
        rows={data.list.rows}
        onCellClick={(selectedRow) => onSelect(selectedRow.id)}
        showPagination={false}
        truncateText={false}
        mode="automated-workflow-entry-points"
        gridChecks={[data.selectedItemId]}
      />
      <div>
        <Button
          disabled={!data.selectedItemId}
          kind="primary"
          className="btnRight"
          variant="contained"
          onClick={onApply}
          type="button"
        >
          { __('Apply')}
        </Button>

        <Button variant="contained" type="button" onClick={onCloseModal} kind="secondary">
          { __('Cancel')}
        </Button>
      </div>

    </>

  );
};
WorkflowEntryPoints.propTypes = {
  entryPoint: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
};

export default WorkflowEntryPoints;
