import React, { useState, useEffect, useMemo } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './miq-alert-set-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const MiqAlertSetForm = ({ recordId, mode }) => {
  const [{
    fields, initialValues, isLoading, emsId, alertState,
  }, setState] = useState({
    fields: [],
    isLoading: !!recordId,
    alertState: [],
  });
  /*
  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };
*/

  const tenantUrl = (emsId) => `/api/alert_definitions?expand=resources&attributes=id,description&filter[]=db=${emsId}`;
  const networkManagers = (emsId) => API.get(tenantUrl(emsId)).then(({ resources }) => {
    console.log("in network manager funtion");
    // let networkManagersOptions = [];
    // networkManagersOptions = resources.map(({ id, description }) => ({ label: description, value: id }));
    const parentTypeArray = [];
    resources.forEach((pt) => {
      const tempObj = { label: pt.description, value: pt.id };
      parentTypeArray.push(tempObj);
    });
    // networkManagersOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
    return parentTypeArray;
  });

  const loadSchema = (emsId, appendState = {}) => {
    console.log('in load schema');

    // not working bc promise is pending
    const alertState = networkManagers(emsId);
    
    /* this hardcode value is working
    const alertState = [{
      label: 'Kickstart',
      value: 'CustomizationTemplateKickstart',
    }];
    */
    console.log("alert state is" + alertState);
    setState((state) => ({
      ...state,
      ...appendState,
      alertState,
      fields,
    }));
  };
  const submitLabel = !!recordId ? __('Save') : __('Add');
  const promise = useMemo(() => API.options('/api/actions'), []);

  const onSubmit = (values) => {
    miqSparkleOn();
    // const data = dataHelper(values);

    const request = recordId ? API.patch(`/api/alert_definition_profiles/${recordId}`, values) : API.post('/api/alert_definition_profiles', values);
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
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/miq_alert_set/show_list');
  };

  useEffect(() => {
    if (recordId) {
      API.get(`/api/alert_definition_profiles/${recordId}`).then((initialValues) => {
        setState({ initialValues, isLoading: false });
      });
    }
  }, [recordId]);

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(fields, !!recordId, emsId, setState, promise, mode, loadSchema, alertState)}
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
