import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer, { useFieldApi, useFormApi } from '@@ddf';
import { componentMapper, validatorMapper } from '@data-driven-forms/carbon-component-mapper';
import createSchema from './generic-objects-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import get from 'lodash/get';
import { TrashCan32 } from '@carbon/icons-react';
import { Button } from 'carbon-components-react';

const GenericObjectForm = ({ recordId }) => {
  const [{ initialValues, isLoading }, setState] = useState({ isLoading: !!recordId });
  const submitLabel = !!recordId ? __('Save') : __('Add');

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const FileUploadComponent = (props) => {
    const { input, meta, label } = useFieldApi(props);
    return (
      <div className='file-upload'>
        <label className='bx--label'>{label}</label>
        <br/>
        <label className='file-upload-label' disabled>{input.value ? input.value : __('No File Chosen')}</label>
        <span className='file-button' tabIndex='0'>
          <label className='file-button-label' htmlFor={input.name}>
            <span className='buttonText'>{__('Choose File')}</span>
            <input className='file-upload-input' id={input.name} {...input}/>
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

  const FileEditComponent = (props) => {
    const { input, label, src, description } = useFieldApi(props);
    const formOptions = useFormApi();

    const deleteFile = () => {
      formOptions.change('image_update', true);
    };

    return (
      <div>
        <label className='bx--label' htmlFor={input.name}>{label}</label>
        <br/>
        <div className='edit-div'>
          <img className='edit-image' id='imageDisplay' src={src}/>
          <Button className='edit-button' renderIcon={TrashCan32} iconDescription={description} hasIconOnly onClick={deleteFile} {...input}/>
        </div>
      </div>
    );
  };

  const fileValidator = ({ maxSize }) => {
    return (value) => {
      const imageTypes = /image\/jpg|image\/jpeg|image\/png|image\/svg/;

      if (value && value.inputFiles[0] && !imageTypes.test(value.inputFiles[0].type))
        return __(`File must be an image of type "png", "jpg/jpeg", or "svg". The currently uploaded file's extension is "${value.inputFiles[0].type.split('/').pop()}"`);

      if (value && value.inputFiles[0] && value.inputFiles[0].size > maxSize)
        return __(`File is too large, maximum allowed size is ${maxSize} bytes. Current file has ${value.inputFiles[0].size} bytes`);
    };
  };

  const syntaxValidator = () => {
    //Attribute, Association, and Method names can only contain lowercase letters, numbers or underscores
    var format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
    return (value) => {
      if (value != value.toLowerCase() || format.test(value))
        return __(`Name can only contain lowercase letters, numbers, or underscores`);
    }
  }

  const mapper = {
    ...componentMapper,
    'file-upload': FileUploadComponent,
    'file-edit': FileEditComponent,
  };

  const validMapper = {
    ...validatorMapper,
    'file': fileValidator,
    'syntax': syntaxValidator,
  };

  useEffect(() => {
    if (recordId) {
      miqSparkleOn();
      API.get(`/api/generic_object_definitions/${recordId}?attributes=picture.image_href`).then(initialValues => {
        API.options('/api/generic_object_definitions/').then(({ data: { allowed_association_types } }) => {
          initialValues.attributes = [];
          initialValues.associations = [];
          initialValues.methods = [];

          for (const object in initialValues.properties.attributes)
            initialValues.attributes.push({ name: object, type: initialValues.properties.attributes[object] });

          for (const object in initialValues.properties.associations)
            initialValues.associations.push({ name: object, class: __(allowed_association_types[initialValues.properties.associations[object]]) });

          for (const object in initialValues.properties.methods)
            initialValues.methods.push({ name: initialValues.properties.methods[object] });

          initialValues['image_update'] = !initialValues.picture;
          delete initialValues.properties;
          setState({ initialValues, isLoading: false });
        });
      });
      miqSparkleOff();
    }
  }, [recordId]);

  const onSubmit = async (values, formApi) => {
    if (values.file_upload) {
      const fileList = get(values, formApi.fileInputs[0]).inputFiles;
      const base64Encoded = await toBase64(fileList[0]);
      values['picture'] = { extension: fileList[0].type.split('/').pop(), content: base64Encoded.split(',').pop() };
    }
    else if (values.image_update)
      values['picture'] = {};

    values['properties'] = { 'attributes': {}, 'associations': {}, 'methods': [] };

    for (const index in values.attributes)
      values.properties.attributes[values.attributes[index].name] = values.attributes[index].type;

    for (const index in values.associations)
      values.properties.associations[values.associations[index].name] = values.associations[index].class.value;

    for (const index in values.methods)
      values.properties.methods.push(values.methods[index].name);

    delete values.associations;
    delete values.attributes;
    delete values.methods;
    delete values.image_update;
    delete values.file_upload;
    miqSparkleOn();

    const request = recordId ? API.patch(`/api/generic_object_definitions/${recordId}`, values) : API.post('/api/generic_object_definitions', values);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('Generic Object Definition "%s" was saved.')
          : __('Generic Object Definition "%s" was added.'),
        values.name,
      );
      miqRedirectBack(message, undefined, '/generic_object_definition/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Generic Object Definition "%s" was cancelled by the user.')
        : __('Add of new Generic Object Definition was cancelled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/generic_object_definition/show_list');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema( initialValues, !!recordId )}
      componentMapper={mapper}
      validatorMapper={validMapper}
      initialValues={initialValues}
      canReset={!!recordId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

GenericObjectForm.propTypes = {
  recordId: PropTypes.string,
};
GenericObjectForm.defaultProps = {
  recordId: undefined,
};

export default GenericObjectForm;
