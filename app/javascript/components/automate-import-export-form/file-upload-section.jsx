import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FileUploader, Button } from '@carbon/react';
import { miqFetch } from '../../http_api/fetch';

const FileUploadSection = ({ onUploadComplete = null }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileUploaderRef = useRef(null);

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

  const handleUpload = async() => {
    if (!selectedFile || isUploading) {
      return;
    }

    setIsUploading(true);
    miqSparkleOn();

    try {
      const formData = new FormData();
      formData.append('upload[file]', selectedFile);

      // Use miqFetch directly to handle FormData properly
      const response = await miqFetch({
        url: '/miq_ae_tools/upload_import_file',
        method: 'POST',
        backendName: __('http'),
        cookieAndCsrf: true,
        skipErrors: [400],
      }, formData);

      if (response.message) {
        add_flash(response.message, response.level || 'success');
      }
      if (response.import_file_upload_id && onUploadComplete) {
        onUploadComplete(response.import_file_upload_id);
      }
    } catch (error) {
      // Error handling is done by miqFetch
      // eslint-disable-next-line no-console
      console.error('Upload error:', error);
      if (error.data && error.data.message) {
        add_flash(error.data.message, 'error');
      }
    } finally {
      setIsUploading(false);
      miqSparkleOff();
    }
  };

  return (
    <div className="file-upload-section">
      <h3>{__('Import Datastore classes (*.zip)')}</h3>
      <div ref={fileUploaderRef}>
        <FileUploader
          labelTitle={__('Upload file')}
          buttonLabel={__('Choose file')}
          buttonKind="primary"
          size="md"
          filenameStatus={selectedFile ? 'edit' : 'complete'}
          accept={['.zip']}
          multiple={false}
          disabled={isUploading}
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
          disabled={!selectedFile || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? __('Uploading...') : __('Upload')}
        </Button>
      </div>
    </div>
  );
};

FileUploadSection.propTypes = {
  onUploadComplete: PropTypes.func,
};

export default FileUploadSection;
