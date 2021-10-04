import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import createSchema from './miq-alert-set-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const MiqAlertSetForm = ({ recordId, mode }) => {
  const [{
    fields, initialValues, isLoading, emsId, alertState, alertOptions,
  }, setState] = useState({
    fields: [],
    isLoading: !!recordId,
    alertState: [],
  });

  // eslint-disable-next-line max-len
  const alertUrl = (emsId, editSelectedOptions) => `/api/alert_definitions?expand=resources&attributes=id,description&filter[]=db=${emsId}&filter[]=or id=[${editSelectedOptions}]`;
  const availiableAlerts = (emsId, selectedOptions, editSelectedOptions, selectedOptionsChanged,
    appendState) => API.get(alertUrl(emsId, editSelectedOptions)).then(({ resources }) => {
    let alertsArray = [];
    resources.forEach((alert) => {
      const tempObj = { label: alert.description, value: alert.id };
      alertsArray.push(tempObj);
    });

    // in edit form, when switching mode without editing selected options
    // add previous selected options to the alertArray and remove duplicates
    if (!selectedOptionsChanged && recordId) {
      selectedOptions.forEach((alert) => {
        const tempObj = { label: alert.label, value: alert.value };
        alertsArray.push(tempObj);
      });
      alertsArray = [...new Map(alertsArray.map((item) => [item.value, item])).values()];
    }
    setState((state) => ({
      ...state,
      ...appendState,
      alertState: alertsArray,
      emsId,
      fields,
    }));
  });

  const loadSchema = (emsId, selectedOptions, editSelectedOptions, selectedOptionsChanged, appendState = {}) => {
    availiableAlerts(emsId, selectedOptions, editSelectedOptions, selectedOptionsChanged, appendState);
  };
  const submitLabel = !!recordId ? __('Save') : __('Add');

  // eslint-disable-next-line camelcase
  const onSubmit = ({ alert_profile_alerts, ...values }) => {
    miqSparkleOn();
    if (recordId) { values.name = values.description; }
    const data = { ...values, miq_alert_ids: alert_profile_alerts };
    const request = recordId ? API.patch(`/api/alert_definition_profiles/${recordId}`, data) : API.post('/api/alert_definition_profiles', data);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('New Alert Profile "%s" has been successfully queued.')
          : __('Add of Alert Profile "%s" has been successfully queued.'),
        values.description,
      );
      miqRedirectBack(message, 'success', '/miq_alert_set/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Alert Profile "%s" was canceled by the user.')
        : __('Creation of new Alert Profile was canceled by the user.'),
      initialValues && initialValues.description,
    );
    miqRedirectBack(message, 'warning', '/miq_alert_set/show_list');
  };
  useEffect(() => {
    if (recordId) {
      API.get(`/api/alert_definition_profiles/${recordId}?attributes=name,description,mode,set_data,miq_alerts&expand=miq_alerts`).then(
        // eslint-disable-next-line camelcase
        ({ miq_alerts, ...initialValues }) => {
          if (initialValues.set_data) {
            initialValues.notes = initialValues.set_data.notes;
          }
          // eslint-disable-next-line camelcase
          if (miq_alerts) {
            initialValues.alert_profile_alerts = miq_alerts.map(({ id }) => id);
          }
          setState(
            {
              initialValues,
              alertOptions: miq_alerts.map(({ id, description }) => ({ label: description, value: id })),
              alertState: [],
              isLoading: false,
            }
          );
        }
      );
    }
  }, [recordId]);

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(fields, !!recordId, emsId, mode, loadSchema, alertState, alertOptions)}
      initialValues={initialValues}
      canReset={!!recordId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

MiqAlertSetForm.propTypes = {
  recordId: PropTypes.string,
  mode: PropTypes.arrayOf(PropTypes.any).isRequired,
};

MiqAlertSetForm.defaultProps = {
  recordId: undefined,
};

export default MiqAlertSetForm;
