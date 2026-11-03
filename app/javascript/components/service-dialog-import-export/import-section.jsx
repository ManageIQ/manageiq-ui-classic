import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FileUploader, Button, InlineLoading } from '@carbon/react';
import { miqFetch } from '../../http_api/fetch';
import miqFlash from '../../helpers/miq-flash';

const ImportSection = ({ onUploadComplete }) => {
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
      fileUploaderRef.current.clearFiles();
    }
  };

  const handleUpload = async() => {
    if (!selectedFile || isUploading) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('upload[file]', selectedFile);

      const response = await miqFetch({
        url: '/miq_ae_customization/upload_import_file',
        method: 'POST',
        backendName: 'http',
        cookieAndCsrf: true,
        skipErrors: [400],
      }, formData);

      if (response.message) {
        miqFlash(response.level || 'success', response.message);
      }
      if (response.import_file_upload_id) {
        onUploadComplete(response.import_file_upload_id, response.dialogs || []);
        handleFileDelete();
      }
    } catch (error) {
      miqFlash('error', (error.data && error.data.message) || __('Upload failed'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="service-dialog-import-section">
      <h3>{__('Import')}</h3>
      <FileUploader
        ref={fileUploaderRef}
        labelTitle={__('Upload file')}
        buttonLabel={__('Choose file')}
        buttonKind="primary"
        size="md"
        filenameStatus={selectedFile ? 'edit' : 'complete'}
        accept={['.yml', '.yaml']}
        multiple={false}
        disabled={isUploading}
        iconDescription={__('Clear file')}
        name="upload[file]"
        onChange={handleFileChange}
        onDelete={handleFileDelete}
      />
      <div className="upload-button-wrapper">
        <Button
          id="upload-service-dialog-import"
          type="button"
          disabled={!selectedFile || isUploading}
          onClick={handleUpload}
        >
          {__('Upload')}
        </Button>
        {isUploading && <InlineLoading description={__('Uploading...')} />}
      </div>
    </div>
  );
};

ImportSection.propTypes = {
  onUploadComplete: PropTypes.func.isRequired,
};

export default ImportSection;
