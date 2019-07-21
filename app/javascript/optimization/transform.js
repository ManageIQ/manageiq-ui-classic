import React from 'react';

function click(url) {
  window.DoNav(url);
}

function queue(url) {
  return (e) => {
    window.miqSparkleOn();
    http
      .post(url, {})
      .then((data) => {
        miqFlashLater({
          message: data.flash,
          level: 'success',
        });

        // FIXME just refresh the GTL
        window.location.reload();
      })
      .catch(() => window.miqSparkleOff());

    e.preventDefault();
    e.stopPropagation();
  };
}

function transformSaved({id, report_id, name, userid, url}) {
  return {
    name,
    userid,
    $onClick: () => click(url),
  };
}

function transformReport({id, name, last_run_on, count, action, url, queue_url}) {
  return {
    name,
    last_run_on: last_run_on ? moment(last_run_on).format('MM/DD/YYYY') : null,
    count,
    action: (
      <button type="button" onClick={queue(queue_url)} className="btn btn-default">
        {__("Queue Report")}
      </button>
    ),
    $onClick: () => click(url),
  };
}

export function miqOptimizationTransform(row) {
  if (row.report_id) { // MiqReportResult
    return transformSaved(row);
  } else { // MiqReport
    return transformReport(row);
  }
}
