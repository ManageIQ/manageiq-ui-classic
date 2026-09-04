import { pick } from 'lodash';
import AsyncAction from '../async-action-button';

const GetCompliantResources = ({
  actionSuccessLabel = __('Compliance check successful'),
  edit = false,
  actionDependencies = [],
  isRequired,
  ...props
}) => {
  const buttonLabel = __('Check Compliant Resources');
  const progressMsg = __('Checking');
  const defaultText = __(' ');
  const helperText = 'Check which currently attached resources comply with the selected capabilities:';
  const noCompliantMsg = __('No currently attached storage resource will comply with the selected capabilities. '
    + 'Attach resources which will comply with them or select other capabilities.');
  const asyncGetCompliance = (fields, fieldNames) => new Promise((resolve, reject) => {
    const url = '/api/storage_services/';
    const resourceFields = [
      ...fieldNames,
      'id',
      'ems_id',
      'compression',
      'thin_provision',
    ];
    const resource = pick(fields, resourceFields);

    API.post(url, { action: 'check_compliant_resources', resource })
      // eslint-disable-next-line camelcase
      .then(({ results: [compliant_resources] = [], ...single }) => {
        // eslint-disable-next-line camelcase
        const { task_id, success } = compliant_resources || single;
        return success ? API.wait_for_task(task_id) : Promise.reject(compliant_resources);
      })
      .then((result) => {
        const emsRefList = result.task_results.compliant_resources;
        // Resolve with the emsRefList so onSuccess can store it for the select's loadOptions.
        // AsyncAction will use resolvedValue as the success label only if it's a string;
        // when it's an array it falls back to actionSuccessLabel.
        resolve(emsRefList.length ? emsRefList : noCompliantMsg);
      })
      .catch(({ message }) => reject([__('Compliance check failed:'), message].join(' ')));
  });

  // Store the emsRefList in the form so storage_resource_id's resolveProps can pass it
  // to filterResourcesByCapabilities as the third argument
  const handleSuccess = (formOptions, emsRefList) => {
    if (Array.isArray(emsRefList)) {
      formOptions.change('compliant_ems_refs', emsRefList);
    }
  };

  return (
    <div className="storage-service-form-async-action">
      <AsyncAction
        {...props}
        asyncAction={asyncGetCompliance}
        actionLabel={buttonLabel}
        actionProgressLabel={progressMsg}
        actionDefaultError={defaultText}
        helperText={helperText}
        actionSuccessLabel={actionSuccessLabel}
        edit={edit}
        actionDependencies={actionDependencies}
        isRequired={isRequired}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

GetCompliantResources.propTypes = {
  ...AsyncAction.propTypes,
};

export default GetCompliantResources;
