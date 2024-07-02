import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import { Button, Loading } from 'carbon-components-react';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import createSchema from './order-service-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import {
  buildFields, prepareSubmitData, updateResponseFieldsData,
} from './helper';
import OrderServiceRefreshButton from './order-service-refresh-button';
import mapper from '../../forms/mappers/componentMapper';
import NotificationMessage from '../notification-message';
import { REFERENCE_TYPES } from './order-service-constants';
import OrderServiceContext from './OrderServiceContext';

const OrderServiceForm = ({ initialData }) => {
  
  const {
    dialogId, resourceActionId, targetId, targetType, apiSubmitEndpoint, apiAction, openUrl, realTargetType, finishSubmitEndpoint,
  } = initialData;

  const componentMapper = {
    ...mapper,
    'refresh-button': OrderServiceRefreshButton,
  };

  const resource = {
    resource_action_id: initialData.resourceActionId,
    target_id: initialData.targetId,
    target_type: initialData.targetType,
    real_target_type: initialData.realTargetType,
  };

  const [activeTab, setActiveTab] = useState(0);
  const [currentRefreshField, setCurrentRefreshField] = useState('');

  const [data, setData] = useState({
    isLoading: true,
    response: undefined,
    responseFrom: 'pageLoad',
    fields: [],
    hasTime: false,
    showPastDates: [],
    showPastDatesFieldErrors: [],
    dateErrorFields: [],
    checkBoxes: [],
    dates: [],
    notification: undefined,
  });
  const [showDateError, setShowDateError] = useState([]);

  /** 'dialogFields' are used to store the dynamic_field values that needs to be passed into the API. */
  const dialogFields = useRef({});

  /**  fieldsToRefresh is an array of field names that has to refreshed. */
  const fieldsToRefresh = useRef([]);

  /** 'refreshInProgress' will be true when a field's refresh action is in progress. */
  const refreshInProgress = useRef(false);

  /** 'fieldResponders' holds the field and its dialog_field_responders received from the api response. */
  const fieldResponders = useRef({});

  const log = useRef('Page Loading...');

  console.log('\n\n\n1 Reloading....', log.current,' - ', data.responseFrom);
  console.log('2 fieldsToRefresh=', fieldsToRefresh.current);
  console.log('3 refreshInProgress=', refreshInProgress.current);
  console.log('3 currentRefreshField=', currentRefreshField);

  const updateDialogFields = ({ fieldName, value }) => { dialogFields.current = { ...dialogFields.current, [fieldName]: value }; };
  const updateFieldsToRefresh = (fieldNames) => { console.log("updateFieldsToRefresh=", fieldNames); fieldsToRefresh.current = fieldNames; };
  const updateFieldResponders = ({ fieldName, responders }) => { fieldResponders.current = { ...fieldResponders.current, [fieldName]: responders }; };
  const updateRefreshInProgress = (status) => { refreshInProgress.current = status; };
  const updateActiveTab = (activeTab) => setActiveTab(activeTab);

  const updateCurrentRefreshField = (currentRefreshField) => {
    log.current = `Updating the currentRefreshField to - ${currentRefreshField}`;
    updateRefreshInProgress(!!currentRefreshField);
    setCurrentRefreshField(currentRefreshField);
  };

  /**
   * Function to handle the current refresh field's change event.
   */
  const changeCurrentRefreshField = (responders) => {
    console.log("5 changeCurrentRefreshField responders=", responders);
    let nextRefreshField;
    if (responders.length > 0) {
      nextRefreshField = responders.shift(); // Select the first item from the array.
      console.log('remaining responders=', ...responders);
      console.log('nextRefreshField=', nextRefreshField);
      updateRefreshInProgress(true);
      updateFieldsToRefresh([...responders]);
      updateCurrentRefreshField(nextRefreshField);
    } else {
      updateRefreshInProgress(false);
      updateCurrentRefreshField(undefined);
    }
  };

  /** Function to handle the fields onChange event. */
  const fieldOnChange = (value, field) => {
    console.log('\n\n\n---------------fieldOnChange start------------', field.name);
    console.log('value=', value);
    console.log('dialogFields.current=', dialogFields.current);
    if (refreshInProgress.current === false && dialogFields.current[field.name] !== value) {
      console.log('inside if loop...')
      updateDialogFields({ fieldName: field.name, value });
      const responders = [...fieldResponders.current[field.name]];
      changeCurrentRefreshField(responders);
    }
    console.log('\n\n\n---------------fieldOnChange end------------');
  };

  const updateFormReference = ({ type, payload }) => {
    switch (type) {
      case REFERENCE_TYPES.activeTab:
        return updateActiveTab(payload);
      case REFERENCE_TYPES.dialogFields:
        return updateDialogFields(payload);
      case REFERENCE_TYPES.fieldsToRefresh:
        return updateFieldsToRefresh(payload);
      case REFERENCE_TYPES.fieldResponders:
        return updateFieldResponders(payload);
      case REFERENCE_TYPES.refreshInProgress:
        return updateRefreshInProgress(payload);
      default:
        return undefined;
    }
  };

  /** 'orderServiceConfig' is used a reference to pass the react specific function to helper files. */
  const orderServiceConfig = {
    fieldOnChange,
    updateFormReference,
    refreshInProgress: !!currentRefreshField,
  };

  /** Function handle the refresh button's click event initiated from the 'OrderServiceRefreshButton' component.
   * When the api response is received, it updates the 'data.response' with the new response.
   * The dialog_field_responders are added to fieldsToRefresh's array.
  */
  const refreshField = () => {
    console.log('7 currentRefreshField...', currentRefreshField);
    const params = {
      action: 'refresh_dialog_fields',
      resource: {
        ...resource,
        dialog_fields: dialogFields.current,
        fields: [currentRefreshField],
      },
    };
    API.post(`/api/service_dialogs/${data.response.id}`, params).then(({ result }) => {
      const newResponse = updateResponseFieldsData(data.response, currentRefreshField, result);
      console.log('api response...', newResponse);
      console.log('fieldsToRefresh.current=', fieldsToRefresh.current);
      const newFieldsToRefresh = [...fieldsToRefresh.current, ...result[currentRefreshField].dialog_field_responders];
      console.log('newFieldsToRefresh=', newFieldsToRefresh);
      updateFieldsToRefresh(newFieldsToRefresh);
      if (newFieldsToRefresh.length === 0) {
        updateRefreshInProgress(false);
      }
      log.current = `refreshField API loaded responseFrom set to - ${currentRefreshField}`;
      buildFields(newResponse, { ...data }, setData, orderServiceConfig, currentRefreshField);
    });
  };

  /** This works when the value in data.response is changed.
   * The first item from 'fieldsToRefresh' array is selected to be refreshed and removed from the array. */
  useEffect(() => {
    console.log('useEffect of responseFrom - ', data.responseFrom);
    if (data.responseFrom !== 'pageLoad' && data.responseFrom !== 'pageLoadOver') {
      console.log('4 useEffect of responseFrom');
      changeCurrentRefreshField(fieldsToRefresh.current);
    }
  }, [data.responseFrom]);

  /** When currentRefreshField is changed, the 'refreshField' action will be executed.
   *  This can be changed from:
   *    - 'OrderServiceRefreshButton' component's refresh button click event.
   *    - After when a field is refreshed, the 'data.responseFrom' is updated which has a useEffect defined.
   *    - This works like a cycle until there is nothing to refresh. */
  useEffect(() => {
    console.log('useEffect of currentRefreshField-', currentRefreshField, '-', data.responseFrom);
    if (currentRefreshField) {
      console.log('6, useEffect of currentRefreshField');
      refreshField();
    }
  }, [currentRefreshField]);

  /** This useEffect is executed when the form is first loaded. */
  useEffect(() => {
    console.log('useEffect of initial load')
    if (data.responseFrom === 'pageLoad') {
      log.current = `Initial API loaded`;
      const url = `/api/service_dialogs/${dialogId}?resource_action_id=${resourceActionId}&target_id=${targetId}&target_type=${targetType}`;
      API.get(url, { skipErrors: [500] })
        .then((response) => buildFields(response, data, setData, orderServiceConfig, 'pageLoadOver'))
        .catch((errorData) => {
          const message = (typeof (errorData) === 'string') ? errorData : errorData.data.error;
          setData({
            ...data,
            responseFrom: 'pageLoadOver',
            isLoading: false,
            notification: { type: 'error', message },
          });
        });
    }
  }, []);

  /** Form submit event handler. */
  const onSubmit = (values) => {
    let submitData = { action: 'order', ...values };

    submitData = prepareSubmitData(values, setShowDateError);

    if (submitData !== false) {
      if (apiSubmitEndpoint.includes('/generic_objects/')) {
        submitData = { action: apiAction, parameters: _.omit(submitData, 'action') };
      } else if (apiAction === 'reconfigure') {
        submitData = { action: apiAction, resource: _.omit(submitData, 'action') };
      }
      return API.post(apiSubmitEndpoint, submitData, { skipErrors: [400] })
        .then((response) => {
          if (openUrl === 'true') {
            return API.wait_for_task(response)
              .then(() =>
                // eslint-disable-next-line no-undef
                $http.post('open_url_after_dialog', { targetId, realTargetType }))
              .then((taskResponse) => {
                if (taskResponse.data.open_url) {
                  window.open(response.data.open_url);
                  miqRedirectBack(__('Order Request was Submitted'), 'success', finishSubmitEndpoint);
                } else {
                  add_flash(__('Automate failed to obtain URL.'), 'error');
                  miqSparkleOff();
                }
              });
          }
          miqRedirectBack(__('Order Request was Submitted'), 'success', finishSubmitEndpoint);
          return null;
        });
    }
    return null;
  };

  /** Form cancel event handler. */
  const onCancel = () => miqRedirectBack(__('Dialog Cancelled'), 'warning', '/catalog');

  return (
    <div className="order-service-form-container">
      {
        data.notification && <NotificationMessage type={data.notification.type} message={data.notification.message} />
      }
      {
        data.isLoading && (
          <div className="loadingSpinner">
            <Loading active small withOverlay={false} className="loading" />
          </div>
        )
      }
      {
        !data.isLoading && (
          <OrderServiceContext.Provider value={{ currentRefreshField, setCurrentRefreshField }}>
            <MiqFormRenderer
              FormTemplate={(props) => (
                <FormTemplate
                  {...props}
                  fields={data.fields}
                  updateFormReference={updateFormReference}
                  responseFrom={data.responseFrom}
                />
              )}
              componentMapper={componentMapper}
              schema={createSchema(data.fields, showDateError, activeTab)}
              initialValues={data.initialValues}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
            {
              // currentRefreshField && <div className="order-service-overlay" title={__('Refresh in progress')} />
            }
          </OrderServiceContext.Provider>
        )
      }
    </div>
  );
};

const FormTemplate = ({ formFields }) => {
  const { handleSubmit, onCancel, getState } = useFormApi();
  const { valid } = getState();

  return (
    <form id="order-service-form" onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {() => (
          <div className="custom-button-wrapper">
            <Button
              disabled={!valid}
              kind="primary"
              className="btnRight"
              type="submit"
              id="submit"
              variant="contained"
            >
              {__('Submit')}
            </Button>
            <Button variant="contained" type="button" onClick={onCancel} kind="secondary">
              { __('Cancel')}
            </Button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

FormTemplate.propTypes = {
  formFields: PropTypes.arrayOf(PropTypes.any).isRequired,
};

OrderServiceForm.propTypes = {
  initialData: PropTypes.shape({
    apiSubmitEndpoint: PropTypes.string.isRequired,
    apiAction: PropTypes.string.isRequired,
    cancelEndPoint: PropTypes.string.isRequired,
    dialogId: PropTypes.number.isRequired,
    finishSubmitEndpoint: PropTypes.string.isRequired,
    openUrl: PropTypes.bool.isRequired,
    resourceActionId: PropTypes.number.isRequired,
    realTargetType: PropTypes.string.isRequired,
    targetId: PropTypes.number.isRequired,
    targetType: PropTypes.string.isRequired,
  }).isRequired,
};

export default OrderServiceForm;
