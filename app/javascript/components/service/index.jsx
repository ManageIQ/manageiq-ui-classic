import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import DialogTabs from './DialogTabs';
import ServiceContext from './ServiceContext';
import ServiceButtons from './ServiceButtons';
import { fetchInitialData, refreshFieldData } from './helper';
import { RefreshStatus, ServiceType } from './constants';
import './services.style.scss';

/** Function to render the Loader during initial API call. */
const renderLoader = () => <div className="loadingSpinner"><Loading active small withOverlay={false} className="loading" /></div>;

/** Component to render -
 * 1. Order Service Form
 * 2. Service Dialogs
 * */
const Service = ({ initialData: { dialogId, params, urls }, serviceType }) => {
  const isOrderServiceForm = serviceType === ServiceType.order;
  let resource;
  if (isOrderServiceForm) {
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
    isOrderServiceForm,
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
      console.log({ type: 'error', message: __('Unexpected error occurred when the field was refreshed.') });
    }
  };

  /** Function to show a notification when the refresh field process is completed. */
  const afterRefreshField = () => {
    refreshStatus.current = RefreshStatus.completed;
    console.log({ type: 'success', message: __('Refresh actions complete.') });
  };

  useEffect(() => {
    let url = `/api/service_dialogs/${dialogId}`;
    if (isOrderServiceForm) {
      const urlParams = `?resource_action_id=${params.resourceActionId}&target_id=${params.targetId}&target_type=${params.targetType}`;
      url = `/api/service_dialogs/${dialogId}${urlParams}`;
    }
    fetchInitialData(url, isOrderServiceForm)
      .then((response) => setData((prevData) => ({ ...prevData, ...response })))
      .catch(() => setData((prevData) => ({ ...prevData, isLoading: false })));
  }, []);

  useEffect(() => {
    if (isOrderServiceForm && data.dialogFields) {
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
      <DialogTabs />
      {isOrderServiceForm && <ServiceButtons />}
    </ServiceContext.Provider>
  );

  return (
    <div className="service-container">
      { data.isLoading ? renderLoader() : renderContent() }
    </div>

  );
};

Service.propTypes = {
  initialData: PropTypes.shape({
    dialogId: PropTypes.number.isRequired,
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
      openUrl: PropTypes.bool.isRequired,
    }),
  }).isRequired,
  serviceType: PropTypes.string.isRequired,
};

export default Service;
