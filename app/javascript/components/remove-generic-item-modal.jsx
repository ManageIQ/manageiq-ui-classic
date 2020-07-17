import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Spinner } from 'patternfly-react';
import { API } from '../http_api';

const parseApiError = (error) => {
  if (error.hasOwnProperty('data')) {
    return error.data.error.message;
  } else if (error.hasOwnProperty('message')) {
    return error.message;
  }
};

export const removeItems = (items, apiUrl, asyncDelete, redirectUrl, treeSelect) => {
  let apiPromises = [];
  let flashArray = [];
  const deleteMessage = asyncDelete ? __('Deletion of item %s has been successfully initiated') : __('The item "%s" has been successfully deleted');

  miqSparkleOn();
  items.forEach(item => {
    apiPromises.push(API.post(`/api/${apiUrl}/${item.id}`, {action: 'delete'}, {skipErrors: [400, 500]})
                       .then((apiResult) => ({result: apiResult.success ? 'success' : 'error', data: apiResult, name: item.name}))
                       .catch((apiResult) => ({result: 'error', data: apiResult, name: item.name})))
  });
  Promise.all(apiPromises)
    .then((apiData) => {
      if (items.length === 1 && apiData[0].result === 'error') {
        add_flash(sprintf(__('Error deleting item "%s": %s'), apiData[0].name, parseApiError(apiData[0].data)), 'error');
        miqSparkleOff();
      } else {
        apiData.forEach(item => {
          let flash = {};
          if (item.result === 'success') {
            flash = {message: sprintf(deleteMessage, item.name), level: 'success'};
          } else if (item.result === 'error' && items.length > 1) {
            flash = {message: sprintf(__('Error deleting item "%s": %s'), item.name, parseApiError(item.data)), level: 'error'};
          }
          miqFlashLater(flash);
        });
      }
      return apiData;
    })
    .then((apiData) => {
      if (items.length > 1 || (items.length === 1 && apiData[0].result === 'success')) {
        if (!treeSelect) {
          window.location.href = redirectUrl;
          miqSparkleOff();
        } else {
          sendDataWithRx({ controller: 'reportDataController', type: 'gtlUnselectAll' });
          miqAjax(`tree_select?id=${treeSelect}`).then(() => miqFlashSaved());
        }
      }
    });
};

class RemoveGenericItemModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false
    };
  }

  componentDidMount() {
    let apiPromises = [];
    const itemsIds = this.props.recordId ? [this.props.recordId] : _.uniq(this.props.gridChecks);

    // Load modal data from API
    itemsIds.forEach(item => apiPromises.push(API.get(`/api/${this.props.modalData.api_url}/${item}`)));
    Promise.all(apiPromises)
      .then(apiData => apiData.map(item => (
        {id:   item.id,
         name: item.name})))
      .then(data => this.setState({data: data, loaded: true}))
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
        addClicked: () => removeItems(this.state.data,
                                      this.props.modalData.api_url,
                                      this.props.modalData.async_delete,
                                      this.props.modalData.redirect_url,
                                      this.props.modalData.tree_select)
      }
    });
    this.props.dispatch({
      type: "FormButtons.customLabel",
      payload: __('Delete'),
    });
  }

  render () {
    const renderSpinner = (spinnerOn) => {
      if (spinnerOn) {
        return <Spinner loading size="lg" />;
      }
    };

    return (
      <Modal.Body className="warning-modal-body">
        {renderSpinner(!this.state.loaded)}
        {this.state.loaded &&
          <div>
             <h4>{__(this.props.modalData.modal_text)}</h4>
             <ul>
               {this.state.data.map(item => (
                 <li key={item.id}><h4><strong>{item.name}</strong></h4></li>
               ))}
             </ul>
          </div>
        }
      </Modal.Body>
    );
  }
}

RemoveGenericItemModal.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect()(RemoveGenericItemModal);
