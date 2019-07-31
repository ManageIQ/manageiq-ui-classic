import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from 'patternfly-react';
import { API } from '../http_api';

const parseApiError = (error) => {
  if (error.hasOwnProperty('data')) {
    return error.data.error.message;
  } else if (error.hasOwnProperty('message')) {
    return error.message;
  }
};

export const removeCatalogItems = (catalogItems) => {
  let apiPromises = [];

  miqSparkleOn();
  catalogItems.forEach(item => {
    apiPromises.push(API.post(`/api/service_templates/${item.id}`, {action: 'delete'}, {skipErrors: [400, 500]})
                       .then((apiResult) => ({result: apiResult.success ? 'success' : 'error', data: apiResult, name: item.name}))
                       .catch((apiResult) => ({result: 'error', data: apiResult, name: item.name})))
  });
  Promise.all(apiPromises)
    .then((apiData) => {
      if (catalogItems.length === 1 && apiData[0].result === 'error') {
        add_flash(sprintf(__('Error deleting catalog item "%s": %s'), apiData[0].name, parseApiError(apiData[0].data)), 'error');
        miqSparkleOff();
      } else {
        apiData.forEach(item => {
          if (item.result === 'success') {
            miqFlashLater({message: sprintf(__('The catalog item "%s" has been successfully deleted'), item.name)});
          } else if (item.result === 'error' && catalogItems.length > 1) {
            miqFlashLater({message: sprintf(__('Error deleting catalog item "%s": %s'), item.name, parseApiError(item.data)), level: 'error'});
          }
        });
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
      data: []
    };
  }

  componentDidMount() {
    let apiPromises = [];
    const catalogItemsIds = this.props.recordId ? [this.props.recordId] : this.props.gridChecks;

    // Load modal data from API
    catalogItemsIds.forEach(item => apiPromises.push(API.get(`/api/service_templates/${item}?attributes=services`)));
    Promise.all(apiPromises)
      .then(apiData => apiData.map(catalogItem => (
        {id:           catalogItem.id,
         name:         catalogItem.name,
         service_type: catalogItem.service_type, // 'atomic' or 'composite'
         services:     catalogItem.services})))
      .then(data => this.setState({data}))
      .then(() => this.props.dispatch({
        type: 'FormButtons.saveable',
        payload: true
      }));

    // Buttons setup
    this.props.dispatch({
      type: 'FormButtons.init',
      payload: {
        newRecord: true,
        pristine: true,
        addClicked: () => removeCatalogItems(this.state.data)
      }
    });
    this.props.dispatch({
      type: "FormButtons.customLabel",
      payload: __('Delete'),
    });
  }

  render () {
    const usedServicesMessage = (data) => {
      let warningItems = [];
      if (data.length === 1) { // We're deleting just one catalog item
        let services = {};
        data[0].services.forEach(service => { services[service.name] = service.id })
        warningItems = Object.keys(services).map(item => ({id: services[item], name: item}));
      } else {                 // We're deleting multiple catalog items
        warningItems = data.filter(item => item.services && item.services.length > 0);
      }
      if (warningItems.length > 0) {
        let warningMessage = '';
        if (data.length === 1 && isCatalogBundle(data[0])) {
          warningMessage = __('The catalog bundle is linked to the following services:');
        } else {
          warningMessage = n__('The catalog item is linked to the following services:',
                               'The following catalog items are linked to services:', data.length)
        }
        return (
          <div>
            <h4>{warningMessage}</h4>
            {warningItems.map(item => (
              <ul key={item.id}><h4><strong>{item.name}</strong></h4></ul>
            ))}
          </div>
        );
      }
    };

    const confirmationMessage = (data) => {
      if (data.length === 1 && isCatalogBundle(data[0])) {
        return __('Are you sure you want to permanently delete the following catalog bundle?');
      } else {
        return n__('Are you sure you want to permanently delete the following catalog item?',
                   'Are you sure you want to permanently delete the following catalog items?', data.length);
      }
    };

    return (
      <Modal.Body className="warning-modal-body">
        {usedServicesMessage(this.state.data)}
        <div>
           <h4>{confirmationMessage(this.state.data)}</h4>
           {this.state.data.map(item => (
             <ul key={item.id}><h4><strong>{item.name}</strong></h4></ul>
           ))}
        </div>
      </Modal.Body>
    );
  }
}

RemoveCatalogItemModal.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect()(RemoveCatalogItemModal);
