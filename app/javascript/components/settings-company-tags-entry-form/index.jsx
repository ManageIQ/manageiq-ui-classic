import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './schema';
import { http } from '../../http_api';

/** component to render the Category Entries Add/Edit Form */
const SettingsCompanyTagsEntryForm = ({ categoryId, entryId, callbackAction }) => {
  const ENTRY_ACTIONS = {
    ADD: 'add',
    SAVE: 'save',
    CANCEL: 'cancel',
  };
  const newRecord = entryId === 'new';
  const [{ initialValues, isLoading }, setState] = useState({
    isLoading: !!categoryId,
  });

  useEffect(() => {
    if (newRecord) {
      setState({ isLoading: false });
    } else {
      http.get(`/ops/category_entries/${categoryId}?entry_id=${entryId}`).then((initialValues) => {
        setState({ initialValues, isLoading: false });
      });
    }
  }, [categoryId]);

  const onSubmit = (values) => {
    miqSparkleOn();
    const params = newRecord
      ? { data: { ...values, button: ENTRY_ACTIONS.ADD }, url: `/ops/ce_accept/${categoryId}` }
      : { data: { ...values, button: ENTRY_ACTIONS.SAVE }, url: `/ops/ce_accept/${categoryId}?entry_id=${entryId}` };

    http.post(params.url, params.data, { skipErrors: [400, 500] })
      .then((response) => {
        if (response.type === 'success') {
          const message = (newRecord)
            ? sprintf(__('Category entry "%s" was created successfully'), values.name)
            : sprintf(__('Category entry "%s" was saved successfully'), values.name);
          add_flash(message, response.type);
          callbackAction(params.data.button, response);
        } else {
          add_flash(response.message, 'error');
        }
      })
      .catch((error) => add_flash(error.message, 'error'));
    miqSparkleOff();
  };

  const onCancel = () => callbackAction(ENTRY_ACTIONS.CANCEL, {});

  return !isLoading && (
    <>
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
    </>
  );
};
SettingsCompanyTagsEntryForm.propTypes = {
  categoryId: PropTypes.number.isRequired,
  entryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  callbackAction: PropTypes.func.isRequired,
};

export default SettingsCompanyTagsEntryForm;
