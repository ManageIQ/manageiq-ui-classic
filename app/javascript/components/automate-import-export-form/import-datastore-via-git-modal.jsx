import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, InlineNotification, Loading } from '@carbon/react';
import datastoreSchema from './datastore-via-git.schema';
import branchTagSchema from './git-branch-tag-selector.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { http } from '../../http_api';

const ImportDatastoreViaGitModal = ({
  isOpen, onClose, onSelectGitRepo, disableSubmit = false,
}) => {
  const [stage, setStage] = useState('url'); // 'url' or 'branch-tag'
  const [taskId, setTaskId] = useState(null);
  const [gitRepoId, setGitRepoId] = useState(null);
  const [gitUrl, setGitUrl] = useState(null);
  const [newGitRepo, setNewGitRepo] = useState(false);
  const [branchNames, setBranchNames] = useState([]);
  const [tagNames, setTagNames] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStage('url');
      setTaskId(null);
      setGitRepoId(null);
      setGitUrl(null);
      setNewGitRepo(false);
      setBranchNames([]);
      setTagNames([]);
      setError(null);
      setSuccess(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Poll for task completion
  useEffect(() => {
    if (!taskId || !gitRepoId) {
      return undefined;
    }

    const pollInterval = setInterval(() => {
      http.get(`/miq_ae_tools/check_git_task?task_id=${taskId}&git_repo_id=${gitRepoId}&new_git_repo=${newGitRepo}`)
        .then((response) => {
          // Task is still running
          if (response.state && response.state !== 'Finished') {
            return; // Continue polling
          }

          // Task completed successfully
          if (response.success) {
            clearInterval(pollInterval);
            setBranchNames(response.git_branches || []);
            setTagNames(response.git_tags || []);
            setSuccess(__('Successfully found git repository, please choose a branch or tag'));
            setStage('branch-tag');
            setTaskId(null);
            setLoading(false);
          } else {
            // Task completed with error
            clearInterval(pollInterval);
            setError(response.message?.message || __('Failed to fetch git repository'));
            setTaskId(null);
            setGitRepoId(null);
            setNewGitRepo(false);
            setLoading(false);
          }
        })
        .catch((err) => {
          clearInterval(pollInterval);
          setError(err.message || __('Failed to check task status'));
          setTaskId(null);
          setGitRepoId(null);
          setNewGitRepo(false);
          setLoading(false);
        });
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [taskId, gitRepoId, newGitRepo]);

  const submitGitUrl = (values) => {
    setLoading(true);
    setError(null);
    setGitUrl(values.git_url); // Store the git URL

    return http.post('/miq_ae_tools/retrieve_git_datastore', values)
      .then((response) => {
        if (response.task_id && response.git_repo_id) {
          setTaskId(response.task_id);
          setGitRepoId(response.git_repo_id);
          setNewGitRepo(response.new_git_repo || false);
          // Loading will be turned off by polling effect
        } else if (response.message) {
          setError(response.message?.message || response.message);
          setLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message || __('Failed to submit git URL'));
        setLoading(false);
      });
  };

  const submitBranchTag = (values) => {
    const gitBranchOrTag = values.ref_type === 'branch' ? values.branch_name : values.tag_name;
    const refType = values.ref_type;

    // Pass the selections back to parent component
    onSelectGitRepo({
      git_repo_id: gitRepoId,
      git_url: gitUrl,
      git_branch_or_tag: gitBranchOrTag,
      ref_type: refType,
    });

    // Close modal
    onClose();
  };

  const handleCancel = () => {
    if (stage === 'branch-tag') {
      // Go back to URL stage
      setStage('url');
      setGitRepoId(null);
      setGitUrl(null);
      setNewGitRepo(false);
      setBranchNames([]);
      setTagNames([]);
      setError(null);
      setSuccess(null);
    } else {
      // Close modal
      onClose();
    }
  };

  const getModalHeading = () => {
    if (stage === 'url') {
      return __('Import Datastore via Git');
    }
    return __('Choose the branch or tag you would like to import');
  };

  return (
    <Modal
      open={isOpen}
      modalHeading={getModalHeading()}
      passiveModal
      onRequestClose={onClose}
      size="md"
      className="import-datastore-via-git-modal"
    >
      {loading && (
        <div className="git-modal-loading">
          <Loading description={__('Loading...')} withOverlay={false} />
        </div>
      )}

      {disableSubmit && (
        <InlineNotification
          kind="warning"
          title={__('Git Import Disabled')}
          subtitle={__('Please enable the git owner role in order to import git repositories')}
          lowContrast
        />
      )}

      {error && (
        <InlineNotification
          kind="error"
          title={__('Error')}
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          lowContrast
        />
      )}

      {success && (
        <InlineNotification
          kind="success"
          title={__('Success')}
          subtitle={success}
          onCloseButtonClick={() => setSuccess(null)}
          lowContrast
        />
      )}

      {!loading && stage === 'url' && (
        <MiqFormRenderer
          initialValues={{ git_verify_ssl: true }}
          schema={datastoreSchema()}
          onSubmit={submitGitUrl}
          onCancel={handleCancel}
          buttonsLabels={{
            submitLabel: __('Submit'),
            cancelLabel: __('Cancel'),
          }}
          disableSubmit={disableSubmit ? ['pristine', 'dirty'] : ['pristine', 'invalid']}
        />
      )}

      {!loading && stage === 'branch-tag' && (
        <MiqFormRenderer
          schema={branchTagSchema(branchNames, tagNames)}
          onSubmit={submitBranchTag}
          onCancel={handleCancel}
          buttonsLabels={{
            submitLabel: __('Select'),
            cancelLabel: __('Back'),
          }}
          disableSubmit={['invalid']}
        />
      )}
    </Modal>
  );
};

ImportDatastoreViaGitModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectGitRepo: PropTypes.func.isRequired,
  disableSubmit: PropTypes.bool,
};

export default ImportDatastoreViaGitModal;
