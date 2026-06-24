import { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Column } from '@carbon/react';
import { locationReload } from '../../helpers/window-location';
import FileUploadSection from './file-upload-section';
import ImportDatastoreViaGit from './import-datastore-via-git';
import ImportDatastoreViaGitModal from './import-datastore-via-git-modal';
import ExportSection from './export-section';
import ResetDatastoreSection from './reset-datastore-section';
import ReviewImportForm from './review-import-form';
import ReviewGitImport from './review-git-import';

const ImportExportPage = ({
  gitImportEnabled,
}) => {
  const [importFileUploadId, setImportFileUploadId] = useState(null);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [gitImportData, setGitImportData] = useState(null);

  const handleUploadComplete = (uploadId) => {
    setImportFileUploadId(uploadId);
  };

  const handleCloseReviewModal = () => {
    setImportFileUploadId(null);
  };

  const handleImportComplete = () => {
    // Refresh the page or update state as needed
    locationReload();
  };

  const handleOpenGitModal = () => {
    setIsGitModalOpen(true);
  };

  const handleCloseGitModal = () => {
    setIsGitModalOpen(false);
  };

  const handleSelectGitRepo = (gitData) => {
    setGitImportData(gitData);
    setIsGitModalOpen(false);
  };

  const handleCloseGitReview = () => {
    setGitImportData(null);
  };

  const handleGitImportComplete = () => {
    // Refresh the page or update state as needed
    locationReload();
  };

  return (
    <div className="import-export-page">
      <Grid>
        <Column sm={4} md={8} lg={16}>
          <div className="import-export-section">
            <FileUploadSection onUploadComplete={handleUploadComplete} />
          </div>
        </Column>

        <Column sm={4} md={8} lg={16}>
          <div className="import-export-section-divider" />
          <div className="import-export-section">
            {gitImportData ? (
              <ReviewGitImport
                gitRepoId={gitImportData.git_repo_id}
                gitUrl={gitImportData.git_url}
                gitBranchOrTag={gitImportData.git_branch_or_tag}
                refType={gitImportData.ref_type}
                onClose={handleCloseGitReview}
                onImportComplete={handleGitImportComplete}
              />
            ) : (
              <ImportDatastoreViaGit
                onOpenModal={handleOpenGitModal}
                disableSubmit={!gitImportEnabled}
              />
            )}
          </div>
        </Column>

        <Column sm={4} md={8} lg={16}>
          <div className="import-export-section-divider" />
          <div className="import-export-section">
            <ExportSection />
          </div>
        </Column>

        <Column sm={4} md={8} lg={16}>
          <div className="import-export-section-divider" />
          <div className="import-export-section">
            <ResetDatastoreSection />
          </div>
        </Column>
      </Grid>

      {importFileUploadId && (
        <ReviewImportForm
          importFileUploadId={importFileUploadId}
          onClose={handleCloseReviewModal}
          onImportComplete={handleImportComplete}
        />
      )}

      <ImportDatastoreViaGitModal
        isOpen={isGitModalOpen}
        onClose={handleCloseGitModal}
        onSelectGitRepo={handleSelectGitRepo}
        disableSubmit={!gitImportEnabled}
      />
    </div>
  );
};

ImportExportPage.propTypes = {
  gitImportEnabled: PropTypes.bool.isRequired,
};

export default ImportExportPage;
