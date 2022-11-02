import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './data-store-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { http } from '../../http_api';

const DatastoreForm = ({
  type, domain, namespacePath, namespaceId, nameReadOnly, descReadOnly,
}) => {
  const isEdit = namespaceId !== 'new';
  const submitLabel = isEdit ? __('Save') : __('Add');

  const [{ initialValues, isLoading }, setState] = useState({
    initialValues: {
      namespacePath, enabled: true,
    },
    isLoading: isEdit,
  });

  useEffect(() => {
    if (isEdit) {
      http.get(`/miq_ae_class/namespace/${namespaceId}`).then((response) => {
        setState({
          initialValues: { ...initialValues, ...response },
          loading: false,
        });
      });
    }
  }, [namespaceId]);

  const onSubmit = (values) => {
    miqSparkleOn();
    const url = (isEdit)
      ? `/miq_ae_class/update_namespace/${namespaceId}?button=save`
      : '/miq_ae_class/create_namespace/new?button=add';
    miqAjaxButton(url, values, { complete: false });
  };

  const onCancel = () => {
    miqSparkleOn();
    let message = '';
    if (isEdit) {
      message = domain
        ? sprintf(__(`Edit of Domain "%s" was cancelled by user.`), initialValues.name)
        : sprintf(__(`Edit of Namespace "%s" was cancelled by user.`), initialValues.name);
    } else {
      message = domain
        ? __('Add of Domain was cancelled by user.')
        : __('Add of Namespace was cancelled by user.');
    }

    miqRedirectBack(message, 'warning', '/miq_ae_class/explorer');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(type, domain, namespacePath, nameReadOnly, descReadOnly)}
      initialValues={initialValues}
      canReset={namespaceId !== 'new'}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

DatastoreForm.propTypes = {
  type: PropTypes.string.isRequired,
  domain: PropTypes.bool.isRequired,
  namespacePath: PropTypes.string.isRequired,
  namespaceId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  nameReadOnly: PropTypes.bool.isRequired,
  descReadOnly: PropTypes.bool.isRequired,
};

export default DatastoreForm;
