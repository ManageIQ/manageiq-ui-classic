import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { http } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './git-domain-refresh-form.schema';

const REF_TYPES = {
  BRANCH: 'branch',
  TAG: 'tag',
};
const DEFAULT_BRANCH = 'origin/master';

const GitDomainRefreshForm = ({
  gitRepoId,
  refType: initialRefType,
  refName: initialRefName,
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

    const params = {
      git_repo_id: gitRepoId,
      git_branch_or_tag: gitBranchOrTag,
      button: 'save',
    };

    return http.post('/miq_ae_class/refresh_git_domain', params, { skipErrors: [400] })
      .then((response) => {
        const message = response.message || __('Successfully refreshed!');
        const level = response.level || 'success';
        miqRedirectBack(message, level, '/miq_ae_class/explorer');
      })
      .catch((error) => {
        const message = error.data?.message || error.message;
        const level = error.data?.level || 'error';
        miqRedirectBack(message, level, '/miq_ae_class/explorer');
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
  gitRepoId: PropTypes.string.isRequired,
  refType: PropTypes.string,
  refName: PropTypes.string,
  branchNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  tagNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

GitDomainRefreshForm.defaultProps = {
  refType: REF_TYPES.BRANCH,
  refName: DEFAULT_BRANCH,
};

export default GitDomainRefreshForm;
