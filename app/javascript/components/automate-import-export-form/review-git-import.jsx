import { useState } from 'react';
import PropTypes from 'prop-types';
import { InlineNotification, Button } from '@carbon/react';
import { http } from '../../http_api';

const ReviewGitImport = ({
  gitRepoId, gitBranchOrTag, gitUrl = null, refType, onClose, onImportComplete = null,
}) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  const handleImport = () => {
    setImporting(true);
    setError(null);
    miqSparkleOn();

    const data = {
      git_repo_id: gitRepoId,
      git_branch_or_tag: gitBranchOrTag,
      button: 'submit',
    };

    http.post('/miq_ae_tools/import_via_git', data)
      .then((response) => {
        miqSparkleOff();
        // Response is an array of flash messages
        if (Array.isArray(response) && response.length > 0) {
          miqFlashLater(response[0]); // eslint-disable-line no-undef
        }
        if (onImportComplete) {
          onImportComplete();
        }
        onClose();
      })
      .catch((err) => {
        miqSparkleOff();
        setError(err.message || __('Failed to import from git'));
        setImporting(false);
      });
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="review-git-import">
      <h3>{__('Review Git Import')}</h3>

      {error && (
        <InlineNotification
          kind="error"
          title={__('Error')}
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          lowContrast
        />
      )}

      <div className="git-import-details">
        <dl>
          <dt>
            <strong>
              {__('Git Repository')}
              :
            </strong>
          </dt>
          <dd>{gitUrl || gitRepoId}</dd>
          <dt>
            <strong>
              {refType === 'branch' ? __('Branch') : __('Tag')}
              :
            </strong>
          </dt>
          <dd>{gitBranchOrTag}</dd>
        </dl>
      </div>

      <div className="form-buttons">
        <Button
          kind="primary"
          onClick={handleImport}
          disabled={importing}
        >
          {__('Import')}
        </Button>
        <Button
          kind="secondary"
          onClick={handleCancel}
          disabled={importing}
        >
          {__('Cancel')}
        </Button>
      </div>
    </div>
  );
};

ReviewGitImport.propTypes = {
  gitRepoId: PropTypes.string.isRequired,
  gitBranchOrTag: PropTypes.string.isRequired,
  gitUrl: PropTypes.string,
  refType: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onImportComplete: PropTypes.func,
};

export default ReviewGitImport;
