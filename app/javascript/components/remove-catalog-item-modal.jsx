/* eslint-disable consistent-return */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Loading, ModalBody } from 'carbon-components-react';
import { API } from '../http_api';

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
        window.location.href = '/catalog/explorer?report_deleted=true';
        miqSparkleOff();
      }
    });
};

const isCatalogBundle = (item) => (item.service_type && item.service_type === 'composite');

class RemoveCatalogItemModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
    };
  }

  componentDidMount() {
    const apiPromises = [];
    const { recordId, gridChecks, dispatch } = this.props;
    const catalogItemsIds = recordId ? [recordId] : _.uniq(gridChecks);

    // Load modal data from API
    catalogItemsIds.forEach((item) => apiPromises.push(API.get(`/api/service_templates/${item}?attributes=services`)));
    Promise.all(apiPromises)
      .then((apiData) => apiData.map((catalogItem) => (
        {
          id: catalogItem.id,
          name: catalogItem.name,
          service_type: catalogItem.service_type, // 'atomic' or 'composite'
          services: catalogItem.services,
        })))
      .then((data) => this.setState({ data, loaded: true }))
      .then(() => dispatch({
        type: 'FormButtons.saveable',
        payload: true,
      }));

    // Buttons setup
    dispatch({
      type: 'FormButtons.init',
      payload: {
        newRecord: true,
        pristine: true,
        // used this.state.data to get updated value from promise (whenever state updates)
        // eslint-disable-next-line react/destructuring-assignment
        addClicked: () => removeCatalogItems(this.state.data),
      },
    });
    dispatch({
      type: 'FormButtons.customLabel',
      payload: __('Delete'),
    });
  }

  render() {
    const usedServicesMessage = (data) => {
      let warningItems = [];
      if (data.length === 1) { // We're deleting just one catalog item
        const services = {};
        data[0].services.forEach((service) => { services[service.name] = service.id; });
        warningItems = Object.keys(services).map((item) => ({ id: services[item], name: item }));
      } else { // We're deleting multiple catalog items
        warningItems = data.filter((item) => item.services && item.services.length > 0);
      }
      if (warningItems.length > 0) {
        let warningMessage = '';
        if (data.length === 1 && isCatalogBundle(data[0])) {
          warningMessage = __('The catalog bundle is linked to the following services:');
        } else {
          // eslint-disable-next-line no-undef
          warningMessage = n__('The catalog item is linked to the following services:',
            'The following catalog items are linked to services:', data.length);
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

    const confirmationMessage = (data) => {
      if (data.length === 1 && isCatalogBundle(data[0])) {
        return __('Are you sure you want to permanently delete the following catalog bundle?');
      }
      // eslint-disable-next-line no-undef
      return n__('Are you sure you want to permanently delete the following catalog item?',
        'Are you sure you want to permanently delete the following catalog items?', data.length);
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

    const { loaded, data } = this.state;
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
}

RemoveCatalogItemModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  recordId: PropTypes.number,
  gridChecks: PropTypes.arrayOf(PropTypes.any),
};

RemoveCatalogItemModal.defaultProps = {
  recordId: undefined,
  gridChecks: undefined,
};

export default connect()(RemoveCatalogItemModal);
