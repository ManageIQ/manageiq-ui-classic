import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './schema';
import handleFailure from '../../helpers/handle-failure';

const SettingsCategoryForm = ({ recordId }) => {
  const newRecord = recordId === 'new';
  const [{ initialValues, isLoading }, setState] = useState({ isLoading: !!recordId });

  const redirectUrl = (categoryId, button) => `/ops/category_edit/${categoryId}?button=${button}`;

  const CATEGORY_ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    SAVE: 'save',
    CANCEL: 'cancel',
    CREATE: 'create',
  };

  useEffect(() => {
    if (newRecord) {
      setState({ isLoading: false });
    } else {
      API.get(`/api/categories/${recordId}`).then((initialValues) => {
        setState({ initialValues, isLoading: false });
      });
    }
  }, [recordId]);

  const onSubmit = (values) => {
    const params = newRecord
      ? { data: values, button: CATEGORY_ACTIONS.ADD, url: `/api/categories/` }
      : { data: { resource: values, action: CATEGORY_ACTIONS.EDIT }, button: CATEGORY_ACTIONS.SAVE, url: `/api/categories/${recordId}` };

    API.post(params.url, params.data, { skipErrors: [400, 500] })
      .then((response) => {
        const categoryId = (newRecord && response && response.results && response.results[0])
          ? response.results[0].id
          : recordId;
        window.miqJqueryRequest(redirectUrl(categoryId, params.button));
      })
      .catch(handleFailure);
  };

  const onCancel = () => window.miqJqueryRequest(redirectUrl(recordId, CATEGORY_ACTIONS.CANCEL));

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(newRecord)}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={() => onCancel()}
      canReset={!newRecord}
      buttonsLabels={{
        submitLabel: newRecord ? __('Add') : __('Save'),
      }}
    />
  );
};

SettingsCategoryForm.propTypes = {
  recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default SettingsCategoryForm;
