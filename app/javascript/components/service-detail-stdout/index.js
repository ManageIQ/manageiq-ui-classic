/* eslint-disable react/no-danger */
/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';

const ServiceDetailStdout = ({ taskid }) => {
  const [Taskresults, setTaskresults] = useState('');
  const [Error, SetError] = useState(undefined);

  useEffect(() => {
    miqSparkleOn();
    API.wait_for_task(taskid)
      .then(({ task_results }) => setTaskresults(task_results))
      .catch((error) => {
        console.error(error);
        SetError(error.message);
      })
      .then(() => {
        miqSparkleOff();
        API.delete(`/api/tasks/${taskid}`);
      });
  }, [taskid]);

  return (
    <div className="standard_output">
      {Error && (
        <>
          <p>
            {' '}
            {__('Error loading data:')}
          </p>
          <p>
            {' '}
            {Error}
          </p>
        </>
      )}
      {Taskresults && (
        <>
          <h3>{__('Standard Output:')}</h3>
          <div className="content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(Taskresults) }} />
        </>
      )}
    </div>

  );
};

export default ServiceDetailStdout;

ServiceDetailStdout.propTypes = {
  taskid: PropTypes.number.isRequired,
};
