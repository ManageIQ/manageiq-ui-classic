/* **********************************************************
 * This file contains dummy data for List and Summary Page.
 * This file can be removed when we have API's in place.
 * ********************************************************** /

/** Dummy data for List Page */
import { rowData } from '../miq-data-table/helper';

/** Note:
 * We are restructuing data like this because this is how we get the data from backend.
 * We can always use a new component and simplify this.
 */

/** Function to return the header information for the list */
const headerInfo = () => [
  { header: __('Name'), key: 'name' },
];

/** Function to return the header information for the service catalog item's entry points. */
const entryPointsHeaderInfo = () => [
  { header: __('Workflows'), key: 'name' },
];

/** Function to return the cell data for a row item. */
const celInfo = (workflow) => [
  { text: workflow.name },
];

/** Function to return the row information for the list */
const rowInfo = (headers, response) => {
  const headerKeys = headers.map((item) => item.key);
  const rows = response.resources.map((workflow) => ({
    id: workflow.id.toString(), cells: celInfo(workflow), clickable: true,
  }));
  // const rows = [...Array(50)].map((_item, index) => ({
  //   id: index.toString(), cells: celInfo(index), clickable: true,
  // }));
  const miqRows = rowData(headerKeys, rows, false);
  return miqRows.rowItems;
};

/** Function to return the dummy data for automated workflows
 * This data is used in data table list.
*/
export const workflowsList = (response) => {
  const headers = headerInfo();
  return { headers, rows: rowInfo(headers, response) };
};

export const workflowsEntryPoints = (response) => {
  const headers = entryPointsHeaderInfo();
  return { headers, rows: rowInfo(headers, response) };
};

/** Dummy data for Summary Page */

const summary = (response) => ([
  { label: __('Name'), value: response.name },
  { label: __('Ems ID'), value: response.ems_id },
  { label: __('Created at'), value: response.created_at },
]);

/** Not being used and can be removed. */
export const jsonData = ` {
  "Comment": "An example of the Amazon States Language using a choice state.",
  "StartAt": "FirstState",
  "States": {
    "FirstState": {
      "Type": "Task",
      "Resource": "docker://agrare/hello-world:latest",
      "Credentials": {
        "mysecret": "dont tell anyone"
      },
      "Retry": [
        {
          "ErrorEquals": [ "States.Timeout" ],
          "IntervalSeconds": 3,
          "MaxAttempts": 2,
          "BackoffRate": 1.5
        }
      ],
      "Catch": [
        {
          "ErrorEquals": [ "States.ALL" ],
          "Next": "FailState"
        }
      ],
      "Next": "ChoiceState"
    },

    "ChoiceState": {
      "Type" : "Choice",
      "Choices": [
        {
          "Variable": "$.foo",
          "NumericEquals": 1,
          "Next": "FirstMatchState"
        },
        {
          "Variable": "$.foo",
          "NumericEquals": 2,
          "Next": "SecondMatchState"
        },
        {
          "Variable": "$.foo",
          "NumericEquals": 3,
          "Next": "SuccessState"
        }
      ],
      "Default": "FailState"
    },

    "FirstMatchState": {
      "Type" : "Task",
      "Resource": "docker://agrare/hello-world:latest",
      "Next": "PassState"
    },

    "SecondMatchState": {
      "Type" : "Task",
      "Resource": "docker://agrare/hello-world:latest",
      "Next": "NextState"
    },

    "PassState": {
      "Type": "Pass",
      "Result": {
        "foo": "bar",
        "bar": "baz"
      },
      "ResultPath": "$.result",
      "Next": "NextState"
    },

    "FailState": {
      "Type": "Fail",
      "Error": "FailStateError",
      "Cause": "No Matches!"
    },

    "SuccessState": {
      "Type": "Succeed"
    },

    "NextState": {
      "Type": "Task",
      "Resource": "docker://agrare/hello-world:latest",
      "Secrets": ["vmdb:aaa-bbb-ccc"],
      "End": true
    }
  }
}`;

export const workflowData = (response) => (
  {
    summary: summary(response),
    jsonData: response.workflow_content,
  }
);
