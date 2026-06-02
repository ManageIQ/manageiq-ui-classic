import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import NoRecordsFound from '../no-records-found';

const AutomationTasksTable = ({ tasks }) => {
  // Map the raw task objects to the format needed for the table
  const rows = tasks.map((task) => ({
    id: task.id.toString(),
    description: task.description || '',
    state: task.state || '',
    message: task.message || '',
    status: task.status || '',
  }));

  const headers = [
    { key: 'description', header: __('Description') },
    { key: 'state', header: __('State') },
    { key: 'message', header: __('Message') },
    { key: 'status', header: __('Status') },
  ];

  if (tasks.length === 0) {
    return (<NoRecordsFound />);
  }

  return (
    <div id="main_div">
      <h3>{__('Automations Tasks')}</h3>
      <MiqDataTable
        headers={headers}
        rows={rows}
        mode="automation-tasks-table"
      />
    </div>
  );
};

AutomationTasksTable.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string,
      state: PropTypes.string,
      message: PropTypes.string,
      status: PropTypes.string,
    })
  ).isRequired,
};

export default AutomationTasksTable;

// Made with Bob
