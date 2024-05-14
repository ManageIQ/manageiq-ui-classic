/** Types of workflow state status */
export const workflowStateTypes = {
  success: { text: 'success', tagType: 'green' },
  error: { text: 'error', tagType: 'red' },
  failure: { text: 'failure', tagType: 'red' },
  failed: { text: 'failed', tagType: 'gray' },
  pending: { text: 'pending', tagType: 'gray' },
  running: { text: 'running', tagType: 'gray' },
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

// Converts the duration time in ms and returns a string in format: w days x hours y minutes z seconds
// duration: time in ms
const convertDuration = (duration) => {
  const durationString = moment.duration(duration, 'milliseconds').toISOString().split('PT')[1];
  let startIndex = 0;
  let resultString = '';
  if (durationString.indexOf('H') >= 0) {
    resultString += `${durationString.slice(startIndex, durationString.indexOf('H'))}h `;
    startIndex = durationString.indexOf('H') + 1;
  }
  if (durationString.indexOf('M') >= 0) {
    resultString += `${durationString.slice(startIndex, durationString.indexOf('M'))}m `;
    startIndex = durationString.indexOf('M') + 1;
  }
  if (durationString.indexOf('S') >= 0) {
    resultString += `${durationString.slice(startIndex, durationString.indexOf('S'))}s`;
    startIndex = durationString.indexOf('S') + 1;
  }
  return resultString;
};

const getItemIcon = (item) => {
  if (item.FinishedTime) {
    if (item.Output && item.Output.Error) {
      if (item.RetryCount) {
        return { icon: 'carbon--RetryFailed' }
      } else {
        return { icon: 'carbon--MisuseOutline' }
      }
    } else {
      return { icon: 'carbon--CheckmarkOutline' }
    }
  } else {
    return { icon: 'carbon--PlayOutline' }
  }
};

/** Function to get the row data of workflow states table. */
const rowData = ({ StateHistory }) => StateHistory.map((item) => ({
  id: item.Guid.toString(),
  name: { text: item.Name, ...getItemIcon(item) },
  enteredTime: convertDate(item.EnteredTime.toString()),
  finishedTime: convertDate(item.FinishedTime.toString()),
  duration: convertDuration(item.Duration * 1000),
}));

/** Function to return the header, row and status data required for the RequestWorkflowStatus component.  */
export const workflowStatusData = (response) => {
  const type = 'ManageIQ::Providers::Workflows::AutomationManager::WorkflowInstance';
  if (response.type !== type) {
    return undefined;
  }
  const rows = response.context ? rowData(response.context) : [];
  if (response.context && response.context.State && !response.context.State.FinishedTime) {
    const state = response.context.State;
    const currentTime = new Date(); // Date Object for current time
    const oldTime = Date.parse(state.EnteredTime); // ms since start time to entered time in UTC
    const durationTime = currentTime.getTime() - oldTime; // ms from entered time to current time

    rows.push({
      id: state.Guid.toString(),
      name: { text: state.Name, ...getItemIcon(state)  },
      enteredTime: convertDate(state.EnteredTime.toString()),
      finishedTime: '',
      duration: convertDuration(durationTime),
    });
  }
  const headers = headerData();
  const name = response.name || response.description;
  return {
    headers, rows, status: response.status, name, parentId: response.parent_id, id: response.id, type: response.type,
  };
};
