import React from 'react';

function transformSaved({id, report_id, name, userid, url}) {
  return {
    name,
    userid,
  };
}

function transformReport({id, name, last_run_on, count, action, url, queue_url}) {
  return {
    name,
    last_run_on: last_run_on ? moment(last_run_on).format('MM/DD/YYYY') : null,
    count,
    action: (
      <button type="button" className="btn btn-default">
        {__("Queue Report")}
      </button>
    ),
  };
}

export function miqOptimizationTransform(row) {
  if (row.report_id) { // MiqReportResult
    return transformSaved(row);
  } else { // MiqReport
    return transformReport(row);
  }
}
