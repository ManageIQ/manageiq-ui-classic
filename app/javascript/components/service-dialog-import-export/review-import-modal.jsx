import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, InlineNotification, InlineLoading, TableContainer, Table, TableHead, TableRow,
  TableHeader, TableBody, TableCell, TableSelectAll, TableSelectRow,
} from '@carbon/react';
import { CheckmarkFilled, Copy } from '@carbon/react/icons';
import { http } from '../../http_api';

const IMPORT_URL = '/miq_ae_customization/import_service_dialogs';
const CANCEL_URL = '/miq_ae_customization/cancel_import_service_dialogs';

const statusDescription = (exists) => (
  exists ? __('This object already exists in the database with the same name') : __('New object')
);

const ReviewImportModal = ({
  importFileUploadId, dialogs, onClose, onImportComplete,
}) => {
  const [selected, setSelected] = useState([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  const allSelected = dialogs.length > 0 && selected.length === dialogs.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () => setSelected(allSelected ? [] : dialogs.map((dialog) => dialog.name));

  const toggleRow = (name) => setSelected(
    selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name]
  );

  const handleCommit = () => {
    setImporting(true);
    setError(null);

    http.post(IMPORT_URL, {
      import_file_upload_id: importFileUploadId,
      dialogs_to_import: selected,
    })
      .then((response) => {
        const flash = Array.isArray(response) ? response[0] : null;
        if (flash && flash.level === 'success') {
          miqFlashLater(flash); // eslint-disable-line no-undef
          onImportComplete();
        } else {
          setError((flash && flash.message) || __('Import failed'));
          setImporting(false);
        }
      })
      .catch((err) => {
        setError(err.message || __('Import failed'));
        setImporting(false);
      });
  };

  const handleCancel = () => {
    http.post(CANCEL_URL, { import_file_upload_id: importFileUploadId })
      .catch(() => {
        // If this fails, the server still deletes the upload after one day.
      });
    onClose();
  };

  return (
    <Modal
      open
      size="md"
      className="service-dialog-review-import-modal"
      modalHeading={__('Import Service Dialogs')}
      primaryButtonText={__('Commit')}
      secondaryButtonText={__('Cancel')}
      primaryButtonDisabled={selected.length === 0 || importing}
      onRequestSubmit={handleCommit}
      onRequestClose={handleCancel}
      onSecondarySubmit={handleCancel}
    >
      {error && (
        <InlineNotification
          kind="error"
          title={error}
          hideCloseButton={false}
          onCloseButtonClick={() => setError(null)}
          lowContrast
        />
      )}
      <TableContainer>
        <Table size="md">
          <TableHead>
            <TableRow>
              <TableSelectAll
                id="service-dialog-import-select-all"
                name="select-all-dialogs"
                ariaLabel={__('Select all dialogs')}
                checked={allSelected}
                indeterminate={someSelected}
                onSelect={toggleAll}
              />
              <TableHeader>{__('Dialog name')}</TableHeader>
              <TableHeader>{__('Status')}</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {dialogs.map((dialog) => (
              <TableRow key={dialog.name}>
                <TableSelectRow
                  id={`service-dialog-import-${dialog.name}`}
                  name={`dialogs_to_import-${dialog.name}`}
                  ariaLabel={dialog.name}
                  checked={selected.includes(dialog.name)}
                  onSelect={() => toggleRow(dialog.name)}
                />
                <TableCell>{dialog.name}</TableCell>
                <TableCell>
                  <span className="service-dialog-import-status">
                    {dialog.exists ? <Copy /> : <CheckmarkFilled />}
                    {statusDescription(dialog.exists)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {importing && <InlineLoading description={__('Importing...')} />}
    </Modal>
  );
};

ReviewImportModal.propTypes = {
  importFileUploadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  dialogs: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    exists: PropTypes.bool,
  })).isRequired,
  onClose: PropTypes.func.isRequired,
  onImportComplete: PropTypes.func.isRequired,
};

export default ReviewImportModal;
