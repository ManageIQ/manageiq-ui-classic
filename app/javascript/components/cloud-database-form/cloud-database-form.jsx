import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'carbon-components-react';
import MiqFormRenderer from '@@ddf';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './cloud-database-form.schema';

const CloudDatabaseForm = ({ recordId }) => {
  const [{
    isLoading, initialValues, fields,
  }, setState] = useState({
    isLoading: !!recordId, initialValues: {}, fields: [],
  });

  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };

  const emptySchema = (appendState = {}) => {
    const fields = [];
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };

  useEffect(() => {
    if (recordId) {
      API.get(`/api/cloud_databases/${recordId}`).then((initialValues) => {
        setState((state) => ({ ...state, initialValues, isLoading: false }));

        API.options(`/api/cloud_databases/${recordId}?ems_id=${initialValues.ems_id}`)
          .then(loadSchema());
      });
    }
  }, [recordId]);

  const onSubmit = (values) => {
    miqSparkleOn();
    const request = recordId ? API.patch(`/api/cloud_databases/${recordId}`, values) : API.post('/api/cloud_databases', values);

    request.then(() => {
      const message = sprintf(recordId
        ? __('Modification of Cloud Database %s has been successfully queued')
        : __('Add of Cloud Database "%s" has been successfully queued.'),
      values.name);

      miqRedirectBack(message, 'success', '/cloud_database/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Cloud Database "%s" was canceled by the user.')
        : __('Creation of new Cloud Database was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/cloud_database/show_list');
  };

  return !isLoading && (
    <Grid>
      <MiqFormRenderer
        initialValues={initialValues}
        schema={createSchema(!!recordId, fields, emptySchema, loadSchema)}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onReset={emptySchema}
        canReset={!recordId}
        buttonsLabels={{
          submitLabel: recordId ? __('Save') : __('Add'),
        }}
      />
    </Grid>
  );
};

CloudDatabaseForm.propTypes = {
  recordId: PropTypes.string,
};

CloudDatabaseForm.defaultProps = {
  recordId: undefined,
};

export default CloudDatabaseForm;
