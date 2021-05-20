import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './zone-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const ZoneForm = ({ recordId }) => {
  const [{ initialValues, isLoading }, setState] = useState({
    isLoading: !!recordId,
  });

  const submitLabel = !!recordId ? __('Save') : __('Add');

  const onSubmit = (values) => {
    miqSparkleOn();

    const request = recordId ? API.patch(`/api/zones/${recordId}`, values) : API.post('/api/zones', values);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('New zone "%s" has been successfully queued.')
          : __('Add of Zone "%s" has been successfully queued.'),
        values.name,
      );
      miqRedirectBack(message, 'success', '/ops');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Zone "%s" was canceled by the user.')
        : __('Creation of new Zone was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/ops');
  };

  useEffect(() => {
    if (recordId) {
      API.get(`/api/zones/${recordId}?attributes=authentications`).then(
        ({ authentications, ...res }) => {
          setState({
            initialValues: {
              ...res,
              authentications: authentications[0],
            },
            isLoading: false,
          });
        },
      );
    }
  }, []);

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(!!recordId)}
      initialValues={initialValues}
      canReset={!!recordId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

ZoneForm.propTypes = {
  recordId: PropTypes.string,
};

ZoneForm.defaultProps = {
  recordId: undefined,
};

export default ZoneForm;
