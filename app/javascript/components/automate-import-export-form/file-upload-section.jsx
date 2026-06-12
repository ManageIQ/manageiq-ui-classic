import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FileUploader, Button } from '@carbon/react';

// Helper function to get CSRF token
const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
};

const FileUploadSection = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileUploaderRef = useRef(null);

  useEffect(() => {
    // Listen for postMessage from the iframe
    const handleMessage = (event) => {
      if (event.data && event.data.import_file_upload_id) {
        miqSparkleOff();

        if (event.data.message) {
          try {
            // Parse message if it's a JSON string
            const msg = typeof event.data.message === 'string'
              ? JSON.parse(event.data.message)
              : event.data.message;
            if (msg && msg.message) {
              add_flash(msg.message, msg.level || 'info');
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error parsing message:', e);
          }
        }

        if (onUploadComplete) {
          onUploadComplete(event.data.import_file_upload_id);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onUploadComplete]);

  const handleFileChange = (event) => {
    const { files } = event.target;
    setSelectedFile(files && files.length > 0 ? files[0] : null);
  };

  const handleFileDelete = () => {
    setSelectedFile(null);

    if (fileUploaderRef.current) {
      const input = fileUploaderRef.current.querySelector('input[type="file"]');
      if (input) {
        input.value = '';
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      miqSparkleOn();
      const form = document.getElementById('upload-form');
      form.submit();
    }
  };

  return (
    <div className="file-upload-section">
      <h3>{__('Import Datastore classes (*.zip)')}</h3>
      <form
        id="upload-form"
        action="/miq_ae_tools/upload_import_file"
        method="post"
        encType="multipart/form-data"
        target="upload_target"
      >
        <input type="hidden" name="authenticity_token" value={getCsrfToken()} />
        <div ref={fileUploaderRef}>
          <FileUploader
            labelTitle={__('Upload file')}
            buttonLabel={__('Choose file')}
            buttonKind="primary"
            size="md"
            filenameStatus={selectedFile ? 'edit' : 'complete'}
            accept={['.zip']}
            multiple={false}
            disabled={false}
            iconDescription={__('Clear file')}
            name="upload[file]"
            onChange={handleFileChange}
            onDelete={handleFileDelete}
          />
        </div>
        <div className="upload-button-wrapper">
          <Button
            id="upload-datastore-import"
            type="button"
            disabled={!selectedFile}
            onClick={handleUpload}
          >
            {__('Upload')}
          </Button>
        </div>
      </form>

      {/* Hidden iframe for form submission */}
      <iframe
        name="upload_target"
        className="import-hidden-iframe"
        title="upload-target"
      />
    </div>
  );
};

FileUploadSection.propTypes = {
  onUploadComplete: PropTypes.func,
};

FileUploadSection.defaultProps = {
  onUploadComplete: null,
};

export default FileUploadSection;
