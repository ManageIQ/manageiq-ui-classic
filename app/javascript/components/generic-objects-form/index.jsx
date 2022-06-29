/* eslint-disable camelcase */
import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import get from 'lodash/get';
import componentMapper from '../../forms/mappers/componentMapper';
import validatorMapper from '../../forms/mappers/validatorMapper';
import toBase64 from '../../helpers/toBase64';
import createSchema from './generic-objects-form.schema';
import { FileEditComponent, uniqueNameValidator } from './helper';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const GenericObjectForm = ({ recordId }) => {
  const [{ initialValues, isLoading, classOptions }, setState] = useState({ isLoading: !!recordId });
  const promise = useMemo(() => API.options('/api/generic_object_definitions/'), []);
  const submitLabel = !!recordId ? __('Save') : __('Add');

  // custom component mapper that includes the file edit component created for the generic objects form
  const mapper = {
    ...componentMapper,
    'file-edit': FileEditComponent,
  };

  const getClassOptions = (allowed_association_types) => Object.keys(allowed_association_types).map((key) => ({
    value: `${key}`,
    label: __(allowed_association_types[key]),
  }));

  useEffect(() => {
    if (recordId) {
      miqSparkleOn();
      API.get(`/api/generic_object_definitions/${recordId}?attributes=picture.image_href`).then((initialValues) => {
        // eslint-disable-next-line camelcase
        promise.then(({ data: { allowed_association_types } }) => {
          initialValues.attributes = [];
          initialValues.associations = [];
          initialValues.methods = [];
          // modifies the attributes/associations/methods data from the API to match what the form is expecting
          Object.entries(initialValues.properties.attributes).forEach((attr) => {
            initialValues.attributes.push({ attributes_name: attr[0], type: attr[1] });
          });
          Object.entries(initialValues.properties.associations).forEach((attr) => {
            initialValues.associations.push({ associations_name: attr[0], class: attr[1] });
          });
          Object.entries(initialValues.properties.methods).forEach((attr) => {
            initialValues.methods.push({ methods_name: attr[1] });
          });

          // check to display file upload/edit component depending on whether the generic object being edited already has a custom image or not
          initialValues.image_update = !initialValues.picture;
          delete initialValues.properties;
          setState({
            initialValues,
            isLoading: false,
            classOptions: getClassOptions(allowed_association_types),
          });
        });
      });
      miqSparkleOff();
    } else {
      promise.then(({ data: { allowed_association_types } }) => {
        setState({
          classOptions: getClassOptions(allowed_association_types),
        });
      });
    }
  }, [recordId]);

  const onSubmit = (values, formApi) => {
    promise.then(async({ data: { allowed_association_types } }) => {
      // check to determine whether to delete or replace existing custom image
      if (values.file_upload) {
        const fileList = get(values, formApi.fileInputs[0]).inputFiles;
        const base64Encoded = await toBase64(fileList[0]);
        values.picture = { extension: fileList[0].type.split('/').pop(), content: base64Encoded.split(',').pop() };
      } else if (values.image_update) values.picture = {};

      // modifies the attributes/methods data from the form to match what the API is expecting
      values.properties = { attributes: {}, associations: {}, methods: [] };
      if (values.attributes) {
        values.attributes.forEach((attr) => {
          values.properties.attributes[attr.attributes_name] = attr.type;
        });
        delete values.attributes;
      }

      if (values.methods) {
        values.methods.forEach((method) => {
          values.properties.methods.push(method.methods_name);
        });
        delete values.methods;
      }

      delete values.image_update;
      delete values.file_upload;

      // data in values.associations is handled differently when editing a generic object
      if (recordId) {
        API.get(`/api/generic_object_definitions/${recordId}?attributes=picture.image_href`).then((initialValues) => {
          if (values.associations) {
            values.associations.forEach((association) => {
              switch (typeof association.class) {
                case 'string':
                  values.properties.associations[association.associations_name] = association.class;
                  break;
                case 'undefined':
                // eslint-disable-next-line max-len
                  values.properties.associations[association.associations_name] = initialValues.properties.associations[association.associations_name];
                  break;
                default:
                  values.properties.associations[association.associations_name] = Object.keys(allowed_association_types).find((key) =>
                    allowed_association_types[key] === association.class.replace(/»/, '').replace(/«/, ''));
              }
            });
            delete values.associations;
          }

          miqSparkleOn();
          const request = API.patch(`/api/generic_object_definitions/${recordId}`, values);
          request.then(() => {
            const message = sprintf(__('Generic Object Definition "%s" was saved.'), values.name);
            miqRedirectBack(message, undefined, '/generic_object_definition/show_list');
          }).catch(miqSparkleOff);
        });
      } else {
        if (values.associations) {
          values.associations.forEach((association) => {
            values.properties.associations[association.associations_name] = association.class;
          });

          delete values.associations;
        }

        miqSparkleOn();
        const request = API.post('/api/generic_object_definitions', values);
        request.then(() => {
          const message = sprintf(__('Generic Object Definition "%s" was added.'), values.name);
          miqRedirectBack(message, undefined, '/generic_object_definition/show_list');
        }).catch(miqSparkleOff);
      }
    });
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
      schema={createSchema(initialValues, !!recordId, promise, classOptions)}
      validate={uniqueNameValidator}
      componentMapper={mapper}
      validatorMapper={validatorMapper}
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
