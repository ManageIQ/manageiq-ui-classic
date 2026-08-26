import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './git-domain-refresh-form.schema';

const REF_TYPES = {
  BRANCH: 'branch',
  TAG: 'tag',
};
const DEFAULT_BRANCH = 'origin/master';

const GitDomainRefreshForm = ({
  domainId,
  gitRepoId,
  refType: initialRefType = REF_TYPES.BRANCH,
  refName: initialRefName = DEFAULT_BRANCH,
  branchNames,
  tagNames,
}) => {
  // Set initial values based on ref type
  const initialValues = {
    git_repo_id: gitRepoId,
    ref_type: initialRefType,
    branch_name: initialRefType === REF_TYPES.BRANCH ? initialRefName : (branchNames[0] || DEFAULT_BRANCH),
    tag_name: initialRefType === REF_TYPES.TAG ? initialRefName : (tagNames[0] || ''),
  };

  const onSubmit = (values) => {
    miqSparkleOn();

    const gitBranchOrTag = values.ref_type === REF_TYPES.BRANCH ? values.branch_name : values.tag_name;

    const payload = {
      action: 'refresh_from_source',
      resource: {
        ref_type: values.ref_type,
        ref: gitBranchOrTag,
      },
    };

    return API.post(`/api/automate_domains/${domainId}`, payload, { skipErrors: [400] })
      .then((response) => {
        const { task_id: taskId, success, message } = response;
        if (success && taskId) {
          // Wait for the async task to complete before redirecting
          return API.wait_for_task(taskId)
            .then(() => {
              const successMessage = message || __('Successfully refreshed!');
              miqRedirectBack(successMessage, 'success', '/miq_ae_class/explorer');
            })
            .catch((error) => {
              const errorMessage = error.data?.error?.message || error.message || __('Failed to refresh domain');
              miqRedirectBack(errorMessage, 'error', '/miq_ae_class/explorer');
            });
        }
        // If no taskId or not successful, handle as error
        const errorMessage = message || __('Failed to refresh domain');
        miqRedirectBack(errorMessage, 'error', '/miq_ae_class/explorer');
        return Promise.reject(new Error(errorMessage));
      })
      .catch((error) => {
        const message = error.data?.error?.message || error.message || __('Failed to refresh domain');
        miqRedirectBack(message, 'error', '/miq_ae_class/explorer');
      });
  };

  const onCancel = () => {
    const message = __('Git based refresh canceled');
    miqRedirectBack(message, 'warning', '/miq_ae_class/explorer');
  };

  return (
    <div className="git-domain-refresh-form">
      <MiqFormRenderer
        schema={createSchema(branchNames, tagNames)}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        buttonsLabels={{
          submitLabel: __('Save'),
          cancelLabel: __('Cancel'),
        }}
        canReset={false}
      />
    </div>
  );
};

GitDomainRefreshForm.propTypes = {
  domainId: PropTypes.string.isRequired,
  gitRepoId: PropTypes.string.isRequired,
  refType: PropTypes.string,
  refName: PropTypes.string,
  branchNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  tagNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default GitDomainRefreshForm;
