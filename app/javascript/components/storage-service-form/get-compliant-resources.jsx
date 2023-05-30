import React from 'react';
import { pick } from 'lodash';
import AsyncAction from '../async-action-button';

const getResourceNames = (emsRefList) =>
  API.get(`/api/storage_resources?expand=resources&attributes=name,ems_ref`)
    .then(({ resources }) => {
      const nameArray = [];
      resources.forEach((resource) => {
        if (emsRefList.includes(resource.ems_ref)) {
          nameArray.push(resource.name);
        }
      });

      return __('Compliant resources: ') + nameArray.join(', ');
    });

const GetCompliantResources = ({ ...props }) => {
  const buttonLabel = __('Check Compliant Resources');
  const progressMsg = __('Checking');
  const defaultText = __(' ');
  const helperText = 'Check which currently attached resources comply with the selected capabilities:';
  const noCompliantMsg = __('No currently attached storage resource will comply with the selected capabilities. '
    + 'Attach resources which will comply with them or select other capabilities.');
  const asyncGetCompliance = (fields, fieldNames) => new Promise((resolve, reject) => {
    const url = '/api/storage_services/';
    fieldNames.push('id', 'ems_id', 'compression', 'thin_provision');
    const resource = pick(fields, fieldNames);

    API.post(url, { action: 'check_compliant_resources', resource })
      // eslint-disable-next-line camelcase
      .then(({ results: [compliant_resources] = [], ...single }) => {
        // eslint-disable-next-line camelcase
        const { task_id, success } = compliant_resources || single;
        return success ? API.wait_for_task(task_id) : Promise.reject(compliant_resources);
      })
      .then((result) => (result.task_results.compliant_resources.length
        ? resolve(getResourceNames(result.task_results.compliant_resources))
        : reject(noCompliantMsg)))
      .catch(({ message }) => reject([__('compliance check failed:'), message].join(' ')));
  });

  return (
    <AsyncAction
      {...props}
      asyncAction={asyncGetCompliance}
      actionLabel={buttonLabel}
      actionProgressLabel={progressMsg}
      actionDefaultError={defaultText}
      helperText={helperText}
    />
  );
};

GetCompliantResources.propTypes = {
  ...AsyncAction.propTypes,
};

GetCompliantResources.defaultPrps = {
  ...AsyncAction.defaultProps,
};

export default GetCompliantResources;
