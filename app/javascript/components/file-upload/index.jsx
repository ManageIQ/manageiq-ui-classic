import React from 'react';
import PropTypes from 'prop-types';

import { useFieldApi } from '@@ddf';

const FileUploadComponent = (props) => {
  const { input, meta, label } = useFieldApi(props);

  return (
    <div className='file-upload'>
      <label className='bx--label'>{label}</label>
      <br />
      <label className='file-upload-label' disabled>{input.value ? input.value : __('No File Chosen')}</label>
      <span className='file-button' tabIndex='0'>
        <label className='file-button-label' htmlFor={input.name}>
          <span className='buttonText'>{__('Choose File')}</span>
          <input className='file-upload-input' id={input.name} {...input} />
        </label>
      </span>
      {meta.error && (
        <div>
          <span style={{ color: 'red' }}>{meta.error}</span>
        </div>
      )}
    </div>
  );
};

FileUploadComponent.propTypes = {
  type: PropTypes.string,
};

FileUploadComponent.defaultProps = {
  type: undefined,
};

export default FileUploadComponent;
