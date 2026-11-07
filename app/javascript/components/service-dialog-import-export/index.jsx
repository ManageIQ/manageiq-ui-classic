import { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Column } from '@carbon/react';
import { locationReload } from '../../helpers/window-location';
import ImportSection from './import-section';
import ExportSection from './export-section';
import ReviewImportModal from './review-import-modal';

const ServiceDialogImportExport = ({ dialogExports = [] }) => {
  const [upload, setUpload] = useState(null);

  const handleUploadComplete = (importFileUploadId, dialogs) => {
    setUpload({ importFileUploadId, dialogs });
  };

  return (
    <div className="import-export-page service-dialog-import-export">
      <Grid>
        <Column sm={4} md={8} lg={16}>
          <div className="import-export-section">
            <ImportSection onUploadComplete={handleUploadComplete} />
          </div>
        </Column>
        <Column sm={4} md={8} lg={16}>
          <div className="import-export-section-divider" />
          <div className="import-export-section">
            <ExportSection dialogExports={dialogExports} />
          </div>
        </Column>
      </Grid>

      {upload && (
        <ReviewImportModal
          importFileUploadId={upload.importFileUploadId}
          dialogs={upload.dialogs}
          onClose={() => setUpload(null)}
          onImportComplete={locationReload}
        />
      )}
    </div>
  );
};

ServiceDialogImportExport.propTypes = {
  dialogExports: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))),
};

export default ServiceDialogImportExport;
