/** Types of workflow state status */
export const workflowStateTypes = {
  success: { text: 'success', tagType: 'green' },
  error: { text: 'error', tagType: 'red' },
  failed: { text: 'failed', tagType: 'gray' },
  pending: { text: 'pending', tagType: 'gray' },
};

/** Function to get the header data of workflow states table. */
const headerData = () => ([
  {
    key: 'name',
    header: __('Name'),
  },
  {
    key: 'enteredTime',
    header: __('Entered Time'),
  },
  {
    key: 'finishedTime',
    header: __('Finished Time'),
  },
  {
    key: 'duration',
    header: __('Duration'),
  },
]);

// const convertDate = (date) => `${moment(date).format('MM/DD/YYYY')} ${moment(date).format('h:mm:ss A')}`;
const convertDate = (date) => {
  const utcDate = new Date(date);
  const year = utcDate.getUTCFullYear();
  const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = utcDate.getUTCDate().toString().padStart(2, '0');
  const hours = utcDate.getUTCHours();
  const minutes = utcDate.getUTCMinutes().toString().padStart(2, '0');
  const period = hours < 12 ? 'AM' : 'PM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12:00 AM

  const formattedDate = `${month}/${day}/${year} ${hours12}:${minutes} ${period}`;
  return formattedDate.toString();
};

/** Function to get the row data of workflow states table. */
const rowData = ({ StateHistory }) => StateHistory.map((item) => ({
  id: item.Guid.toString(),
  name: item.Name,
  enteredTime: convertDate(item.EnteredTime.toString()),
  finishedTime: convertDate(item.FinishedTime.toString()),
  duration: item.Duration.toFixed(3).toString(),
}));

/** Function to return the header, row and status data required for the RequestWorkflowStatus component.  */
export const workflowStatusData = (response) => {
  const type = 'ManageIQ::Providers::Workflows::AutomationManager::WorkflowInstance';
  if (response.type !== type) {
    return undefined;
  }
  const rows = response.context ? rowData(response.context) : [];
  const headers = headerData();
  const name = response.name || response.description;
  return {
    headers, rows, status: response.status, name, parentId: response.parent_id, id: response.id, type: response.type,
  };
};
