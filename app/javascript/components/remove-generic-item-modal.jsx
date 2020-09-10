import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Spinner } from 'patternfly-react';
import { API } from '../http_api';

const apiTransformFunctions = {
  buttonGroup: (item) => ({id: item.id, name: item.name.split('|')[0]}),
  default: (item) => ({id: item.id, name: item.name}),
};

const parseApiError = (error) => {
  if (error.hasOwnProperty('data')) {
    return error.data.error.message;
  } else if (error.hasOwnProperty('message')) {
    return error.message;
  }
};

export const removeItems = (items, { ajaxReload, apiUrl, asyncDelete, redirectUrl, treeSelect }) => {
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
        if (!treeSelect && !ajaxReload) {
          window.location.href = redirectUrl;
          miqSparkleOff();
        } else {
          sendDataWithRx({ type: 'gtlUnselectAll' });
          miqAjax(treeSelect ? `tree_select?id=${treeSelect}` : `reload?deleted=true`)
            .then(() => miqFlashSaved());
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
    const itemsIds = this.props.recordId ? [this.props.recordId] : _.uniq(this.props.gridChecks);
    const {
      ajax_reload,
      api_url,
      async_delete,
      display_field = 'name',
      redirect_url,
      tree_select,
    } = this.props.modalData;

    let transformFn = apiTransformFunctions['default'];

    if (this.props.modalData.transform_fn) {
      transformFn = apiTransformFunctions[this.props.modalData.transform_fn];
    }
    // Load modal data from API
    Promise.all(itemsIds.map((item) => API.get(`/api/${api_url}/${item}`)))
      .then(apiData => apiData.map(transformFn))
      .then((apiData) => apiData.map((item) => ({
        id: item.id,
        name: item[display_field],
      })))
      .then((data) => this.setState({
        data,
        loaded: true,
      }))
      .then(() => this.props.dispatch({
        type: 'FormButtons.saveable',
        payload: true,
      }));

    // Buttons setup
    this.props.dispatch({
      type: 'FormButtons.init',
      payload: {
        newRecord: true,
        pristine: true,
        addClicked: () => removeItems(this.state.data, {
          ajaxReload: ajax_reload,
          apiUrl: api_url,
          asyncDelete: async_delete,
          redirectUrl: redirect_url,
          treeSelect: tree_select,
        }),
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
