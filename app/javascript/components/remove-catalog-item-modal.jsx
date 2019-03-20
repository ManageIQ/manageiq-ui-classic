import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Modal } from 'patternfly-react';
import { cleanVirtualDom } from '../miq-component/helpers';

const SHOW_REMOVE_CATALOG_ITEM_MODAL = '@@catalogItemRemovalModal/show';
const HIDE_REMOVE_CATALOG_ITEM_MODAL = '@@catalogItemRemovalModal/hide';
const LOAD_REMOVE_CATALOG_ITEM_MODAL = '@@catalogItemRemovalModal/load';

const showModal = () => (dispatch) => {
  let apiPromises = [];
  const catalogItemsIds = ManageIQ.record.recordId ? [ManageIQ.record.recordId] : ManageIQ.gridChecks;

  catalogItemsIds.map(item => {
    apiPromises.push(API.get(`/api/service_templates/${item}?attributes=services`));
  });
  Promise.all(apiPromises)
    .then((apiData) => (apiData.map(catalogItem => ({id: catalogItem.id, name: catalogItem.name, services: catalogItem.services}))))
    .then((data) => dispatch({type: LOAD_REMOVE_CATALOG_ITEM_MODAL, data}))
    .then(() => dispatch({type: SHOW_REMOVE_CATALOG_ITEM_MODAL}));
};

const hideModal = () => ({ type: HIDE_REMOVE_CATALOG_ITEM_MODAL });

const parseApiError = (error) => {
  const { data: { error: { message } } } = error;
  return message;
};

const removeCatalogItem = (catalogItems) => (dispatch) => {
  let apiPromises = [];

  dispatch(hideModal());
  miqSparkleOn();
  catalogItems.map(item => {
    apiPromises.push(API.post(`/api/service_templates/${item.id}`, {action: 'delete'}, {skipErrors: [400, 500]})
                       .then((apiResult) => ({result: 'success', data: apiResult, name: item.name}))
                       .catch((apiResult) => ({result: 'error', data: apiResult, name: item.name})))
  });
  Promise.all(apiPromises)
    .then((apiData) => {
      if (catalogItems.length > 1 || (catalogItems.length === 1 && apiData[0].result === 'success')) {
        window.location.href = '/catalog/explorer?report_deleted=true';
      } else {
        add_flash(sprintf(__('Error removing catalog item "%s": %s'), apiData[0].name, parseApiError(apiData[0].data)), 'error');
        miqSparkleOff();
      }
      return apiData;
    })
    .then((apiData) => {
      apiData.map(item => {
        if (item.result === 'success') {
          miqFlashLater({message: sprintf(__('The catalog item "%s" has been successfully removed'), item.name)});
        } else if (item.result === 'error' && catalogItems.length > 1) {
          miqFlashLater({message: sprintf(__('Error removing catalog item "%s": %s'), item.name, parseApiError(item.data)), level: 'error'});
        }
      });
      miqSparkleOff();
    });
};

ManageIQ.redux.addReducer({
  RemoveCatalogItemModal: function RemoveCatalogItemModalReducer(state = { show: false }, action) {
    switch (action.type) {
      case SHOW_REMOVE_CATALOG_ITEM_MODAL:
        return { ...state, show: true };
      case HIDE_REMOVE_CATALOG_ITEM_MODAL:
        return { ...state, show: false };
      case LOAD_REMOVE_CATALOG_ITEM_MODAL:
        return { ...state, data: action.data };
      default:
        return state;
    }
  },
});

class RemoveCatalogItemModal extends React.Component {
  componentDidMount() {
    this.subscribe = window.listenToRx((event) => {
      if (event.type === 'removeCatalogItemModal') {
        this.props.showModal();
      }
    });
  }

  render () {
    const { data } = this.props;

    const usedServicesMessage = (data) => {
      let warningItems = [];
      if (data.length === 1) { // We're deleting just one catalog item
        warningItems = data[0].services.map(service => ({id: service.id, name: service.name}));
      } else { // We're deleting multiple catalog items
        warningItems = data.filter(item => item.services && item.services.length > 0);
      }
      if (warningItems.length > 0) {
        return (
          <div>
            <h4>{n__('The catalog item is linked to the following services:',
                     'The following catalog items are linked to services:', data.length)}</h4>
            {warningItems.map(item => (
              <ul key={item.id}><h4><strong>{item.name}</strong></h4></ul>
            ))}
          </div>
        );
      }
    };

    return (
      <Modal show={this.props.show} onHide={this.props.hideModal} backdrop="static">
        <Modal.Header>
          <Modal.CloseButton onClick={this.props.hideModal} />
          <Modal.Title>{n__('Remove Catalog Item', 'Remove Catalog Items', data ? data.length : 1)}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="warning-modal-body">
          {data && usedServicesMessage(data)}
          <div>
             <h4>{n__('Are you sure you want to remove the following catalog item?',
                      'Are you sure you want to remove the following catalog items?', data ? data.length : 1)}</h4>
             {data && data.map(item => (
               <ul key={item.id}><h4><strong>{item.name}</strong></h4></ul>
             ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="default" className="btn-cancel" onClick={this.props.hideModal}>
            {__('Cancel')}
          </Button>
          <Button
            bsStyle="primary"
            onClick={() => this.props.removeCatalogItem(data)}>
            {__('Remove')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

RemoveCatalogItemModal.propTypes = {
  show: PropTypes.bool,
  data: PropTypes.array,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  removeCatalogItem: PropTypes.func.isRequired
};

RemoveCatalogItemModal.defaultProps = {
  show: false,
  data: undefined
};

const mapStateToProps = state => (state.RemoveCatalogItemModal ? { show: state.RemoveCatalogItemModal.show, data: state.RemoveCatalogItemModal.data  } : {});
const mapDispatchToProps = dispatch => bindActionCreators({ showModal, hideModal, removeCatalogItem }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(RemoveCatalogItemModal);
