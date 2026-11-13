import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Loading, InlineNotification } from '@carbon/react';
import classNames from 'classnames';
import DialogTabs from './DialogTabs';
import ServiceContext from './ServiceContext';
import ServiceButtons from './ServiceButtons';
import { fetchInitialData, refreshFieldData } from './helper';
import { RefreshStatus, ServiceType } from './constants';
import ServiceValidator from './ServiceValidator';
import './services.style.scss';

/** Function to render the Loader during initial API call. */
const renderLoader = () => <div className="service-loading-spinner"><Loading active small withOverlay={false} className="loading" /></div>;

/** Component to render (ServiceType)-
 * 1. Order Service Form
 * 2. Service Dialogs
 * 3. Service Request
 * 4. Service Reconfigure
 * */
const Service = ({
  initialData: {
    dialogId, params, urls, requestDialogOptions, dialogReplaceData,
  }, serviceType,
}) => {
  const isOrderServiceForm = serviceType === ServiceType.order;
  const isServiceReconfigure = serviceType === ServiceType.reconfigure;
  const showButtons = isOrderServiceForm || isServiceReconfigure;

  let resource;
  if (isOrderServiceForm || isServiceReconfigure) {
    resource = {
      resource_action_id: params.resourceActionId,
      target_id: params.targetId,
      target_type: params.targetType,
      real_target_type: params.realTargetType,
    };
  }

  const [data, setData] = useState({
    isLoading: true,
    apiResponse: undefined,
    fieldsToRefresh: [],
    dialogFields: undefined,
    urls,
    params,
    isOrderServiceForm,
    isServiceReconfigure,
    locked: false,
    groupFieldsByTab: {},
    serviceType,
  });

  const refreshStatus = useRef(RefreshStatus.notStarted);

  /** Function to handle the onClick event of a field's refresh-button. */
  const refreshField = async(newData) => {
    try {
      const { updatedApiResponse, remaining, responders } = await refreshFieldData(newData, resource);
      setData((prevData) => ({
        ...prevData,
        apiResponse: updatedApiResponse,
        fieldsToRefresh: [...remaining, ...responders],
      }));
    } catch {
      // Stop refreshing, otherwise the fields stay disabled with a spinner for ever.
      setData((prevData) => ({
        ...prevData,
        fieldsToRefresh: [],
        submitError: [__('Unexpected error occurred when the field was refreshed.')],
      }));
    }
  };

  /** Function to show a notification when the refresh field process is completed. */
  const afterRefreshField = () => {
    refreshStatus.current = RefreshStatus.completed;
    // eslint-disable-next-line no-console
    console.log({ type: 'success', message: __('Refresh actions complete.') });
  };

  useEffect(() => {
    // The constructor registers the validator as ServiceValidator.instance, which the fields use for validation.
    // eslint-disable-next-line no-new
    new ServiceValidator(serviceType);

    let url;

    if (isServiceReconfigure) {
      url = `/api/services/${params.targetId}?attributes=reconfigure_dialog`;
    } else {
      url = `/api/service_dialogs/${dialogId}`;
      if (isOrderServiceForm) {
        const urlParams = `?resource_action_id=${params.resourceActionId}&target_id=${params.targetId}&target_type=${params.targetType}`;
        url = `/api/service_dialogs/${dialogId}${urlParams}`;
      }
    }

    fetchInitialData(url, requestDialogOptions, serviceType, dialogReplaceData)
      .then((response) => setData((prevData) => ({ ...prevData, ...response })))
      .catch(() => setData((prevData) => ({ ...prevData, isLoading: false })));
  }, []);

  useEffect(() => {
    if ((isOrderServiceForm || isServiceReconfigure) && data.dialogFields) {
      if (data.fieldsToRefresh.length > 0) {
        refreshField({ ...data });
      } else if (refreshStatus.current !== RefreshStatus.notStarted) {
        afterRefreshField();
      }
    }
  }, [data.fieldsToRefresh]);

  /** Function to render the form contents like Tabs, Section and Fields. */
  const renderContent = () => (
    <ServiceContext.Provider value={{ data, setData }}>
      {data.submitError && data.submitError.map((message) => (
        <InlineNotification
          key={message}
          kind="error"
          title={message}
          lowContrast
          onCloseButtonClick={() => setData((prev) => ({ ...prev, submitError: null }))}
        />
      ))}
      <DialogTabs />
      {showButtons && <ServiceButtons />}
    </ServiceContext.Provider>
  );

  return (
    <div className={classNames('service-container', serviceType)}>
      { data.isLoading ? renderLoader() : renderContent() }
    </div>
  );
};

Service.propTypes = {
  initialData: PropTypes.shape({
    dialogId: PropTypes.number.isRequired,
    requestDialogOptions: PropTypes.shape({}),
    dialogReplaceData: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array]),
    })),
    params: PropTypes.shape({
      resourceActionId: PropTypes.number,
      targetId: PropTypes.number,
      targetType: PropTypes.string,
      realTargetType: PropTypes.string,
    }),
    urls: PropTypes.shape({
      apiSubmitEndpoint: PropTypes.string.isRequired,
      apiAction: PropTypes.string.isRequired,
      cancelEndPoint: PropTypes.string.isRequired,
      finishSubmitEndpoint: PropTypes.string.isRequired,
      openUrl: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    }),
  }).isRequired,
  serviceType: PropTypes.string.isRequired,
};

export default Service;
