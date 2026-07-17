/* eslint-disable consistent-return */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Loading, ModalBody } from '@carbon/react';
import { API } from '../http_api';
import { setLocationHref } from '../helpers/window-location';

const parseApiError = (error) => {
  // eslint-disable-next-line no-prototype-builtins
  if (error.hasOwnProperty('data')) {
    return error.data.error.message;
  // eslint-disable-next-line no-prototype-builtins
  } if (error.hasOwnProperty('message')) {
    return error.message;
  }
};

export const removeCatalogItems = (catalogItems) => {
  const apiPromises = [];

  miqSparkleOn();
  catalogItems.forEach((item) => {
    apiPromises.push(API.post(`/api/service_templates/${item.id}`, { action: 'delete' }, { skipErrors: [400, 500] })
      .then((apiResult) => ({ result: apiResult.success ? 'success' : 'error', data: apiResult, name: item.name }))
      .catch((apiResult) => ({ result: 'error', data: apiResult, name: item.name })));
  });
  Promise.all(apiPromises)
    .then((apiData) => {
      if (catalogItems.length === 1 && apiData[0].result === 'error') {
        add_flash(sprintf(__('Error deleting catalog item "%s": %s'), apiData[0].name, parseApiError(apiData[0].data)), 'error');
        miqSparkleOff();
      } else {
        apiData.forEach((item) => {
          if (item.result === 'success') {
            // eslint-disable-next-line no-undef
            miqFlashLater({ message: sprintf(__('The catalog item "%s" has been successfully deleted'), item.name) });
          } else if (item.result === 'error' && catalogItems.length > 1) {
            // eslint-disable-next-line no-undef
            miqFlashLater({ message: sprintf(__('Error deleting catalog item "%s": %s'), item.name, parseApiError(item.data)), level: 'error' });
          }
        });
        miqSparkleOff();
      }
      return apiData;
    })
    .then((apiData) => {
      if (catalogItems.length > 1 || (catalogItems.length === 1 && apiData[0].result === 'success')) {
        setLocationHref('/catalog/explorer?report_deleted=true');
        miqSparkleOff();
      }
    });
};

const isCatalogBundle = (item) => (item.service_type && item.service_type === 'composite');

function RemoveCatalogItemModal({
  recordId = undefined,
  gridChecks = undefined,
}) {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const catalogItemsIds = recordId ? [recordId] : _.uniq(gridChecks);
    const apiPromises = [];

    // Load modal data from API
    catalogItemsIds.forEach((item) => apiPromises.push(API.get(`/api/service_templates/${item}?attributes=services`)));
    Promise.all(apiPromises)
      .then((apiData) => apiData.map((catalogItem) => ({
        id: catalogItem.id,
        name: catalogItem.name,
        service_type: catalogItem.service_type,
        services: catalogItem.services,
      })))
      .then((loadedData) => {
        setData(loadedData);
        setLoaded(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-register the delete button handler whenever data changes so addClicked
  // always closes over the up-to-date loaded array, not the initial [].
  useEffect(() => {
    dispatch({
      type: 'FormButtons.init',
      payload: {
        newRecord: true,
        pristine: true,
        customLabel: 'Delete', // NOTE: This will be translated in <MiqButton />
        addClicked: () => removeCatalogItems(data),
      },
    });
    if (data.length > 0) {
      dispatch({ type: 'FormButtons.saveable', payload: true });
    }
  }, [data]);

  const usedServicesMessage = (items) => {
    let warningItems = [];
    if (items.length === 1) {
      const services = {};
      items[0].services.forEach((service) => { services[service.name] = service.id; });
      warningItems = Object.keys(services).map((item) => ({ id: services[item], name: item }));
    } else {
      warningItems = items.filter((item) => item.services && item.services.length > 0);
    }
    if (warningItems.length > 0) {
      let warningMessage = '';
      if (items.length === 1 && isCatalogBundle(items[0])) {
        warningMessage = __('The catalog bundle is linked to the following services:');
      } else {
        // eslint-disable-next-line no-undef
        warningMessage = n__('The catalog item is linked to the following services:',
          'The following catalog items are linked to services:', items.length);
      }
      return (
        <div>
          <h4>{warningMessage}</h4>
          {warningItems.map((item) => (
            <ul key={item.id}><h4><strong>{item.name}</strong></h4></ul>
          ))}
        </div>
      );
    }
  };

  const confirmationMessage = (items) => {
    if (items.length === 1 && isCatalogBundle(items[0])) {
      return __('Are you sure you want to permanently delete the following catalog bundle?');
    }
    // eslint-disable-next-line no-undef
    return n__('Are you sure you want to permanently delete the following catalog item?',
      'Are you sure you want to permanently delete the following catalog items?', items.length);
  };

  const renderSpinner = (spinnerOn) => {
    if (spinnerOn) {
      return (
        <div className="loadingSpinner">
          <Loading active small withOverlay={false} className="loading" />
        </div>
      );
    }
  };

  return (
    <ModalBody className="warning-modal-body">
      {renderSpinner(!loaded)}
      {usedServicesMessage(data)}
      {loaded
        && (
          <div>
            <h4>{confirmationMessage(data)}</h4>
            <ul>
              {data.map((item) => (
                <li key={item.id}><h4><strong>{item.name}</strong></h4></li>
              ))}
            </ul>
          </div>
        )}
    </ModalBody>
  );
}

RemoveCatalogItemModal.propTypes = {
  recordId: PropTypes.string,
  gridChecks: PropTypes.arrayOf(PropTypes.any),
};

export default RemoveCatalogItemModal;
