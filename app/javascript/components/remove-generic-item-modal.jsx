/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Loading, ModalBody } from 'carbon-components-react';
import { API } from '../http_api';

const apiTransformFunctions = {
  buttonGroup: (item) => ({
    id: item.id,
    name: item.name.split('|')[0],
  }),
  default: (item, { display_field = 'name' }) => ({
    id: item.id,
    name: item[display_field],
    supports_safe_delete: !!item.supports_safe_delete,
  }),
};

// eslint-disable-next-line consistent-return
const parseApiError = (error) => {
  // eslint-disable-next-line no-prototype-builtins
  if (error.hasOwnProperty('data')) {
    return error.data.error.message;
  // eslint-disable-next-line no-prototype-builtins
  } if (error.hasOwnProperty('message')) {
    return error.message;
  }
};

export const removeItems = (items, force, {
  ajaxReload, apiUrl, asyncDelete, redirectUrl, treeSelect,
}) => {
  const apiPromises = [];
  // eslint-disable-next-line no-unused-vars
  const flashArray = [];
  const deleteMessage = asyncDelete ? __('Deletion of item %s has been successfully initiated') : __('The item "%s" has been successfully deleted');

  miqSparkleOn();
  if (force) {
    items.forEach((item) => {
      apiPromises.push(API.post(`/api/${apiUrl}/${item.id}`, { action: 'delete' }, { skipErrors: [400, 500] })
        .then((apiResult) => ({ result: apiResult.success ? 'success' : 'error', data: apiResult, name: item.name }))
        .catch((apiResult) => ({ result: 'error', data: apiResult, name: item.name })));
    });
  } else {
    items.forEach((item) => {
      apiPromises.push(API.post(`/api/${apiUrl}/${item.id}`, { action: 'safe_delete' }, { skipErrors: [400, 500] })
        .then((apiResult) => ({ result: apiResult.success ? 'success' : 'error', data: apiResult, name: item.name }))
        .catch((apiResult) => ({ result: 'error', data: apiResult, name: item.name })));
    });
  }

  Promise.all(apiPromises)
    .then((apiData) => {
      if (items.length === 1 && apiData[0].result === 'error') {
        add_flash(sprintf(__('Error deleting item "%s": %s'), apiData[0].name, parseApiError(apiData[0].data)), 'error');
        miqSparkleOff();
      } else {
        apiData.forEach((item) => {
          let flash = {};
          if (item.result === 'success') {
            flash = { message: sprintf(deleteMessage, item.name), level: 'success' };
          } else if (item.result === 'error' && items.length > 1) {
            flash = { message: sprintf(__('Error deleting item "%s": %s'), item.name, parseApiError(item.data)), level: 'error' };
          }
          // eslint-disable-next-line no-undef
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
            // eslint-disable-next-line no-undef
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
      loaded: false,
    };
  }

  componentDidMount() {
    const {
      recordId, gridChecks, modalData, dispatch,
    } = this.props;
    const itemsIds = gridChecks && Array.isArray(gridChecks) && gridChecks.length > 0 ? _.uniq(gridChecks) : [recordId];
    const {
      ajax_reload,
      api_url,
      async_delete,
      display_field = 'name',
      redirect_url,
      tree_select,
    } = modalData;

    let transformFn = apiTransformFunctions.default;

    if (modalData.transform_fn) {
      transformFn = apiTransformFunctions[modalData.transform_fn];
    }
    // Load modal data from API
    let extra_attributes = '';
    if (modalData.try_safe_delete) {
      extra_attributes += '/?attributes=supports_safe_delete';
    }

    Promise.all(itemsIds.map((item) => API.get(`/api/${api_url}/${item}${extra_attributes}`)))
      .then((apiData) => apiData.map((item) => transformFn(item, { display_field })))
      .then((data) => this.setState({
        data,
        force: !this.isSafeDeleteSupported(data),
        loaded: true,
      }))
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
        // eslint-disable-next-line react/destructuring-assignment
        addClicked: () => removeItems(this.state.data, this.state.force, {
          ajaxReload: ajax_reload,
          apiUrl: api_url,
          asyncDelete: async_delete,
          redirectUrl: redirect_url,
          treeSelect: tree_select,
        }),
      },
    });
    dispatch({
      type: 'FormButtons.customLabel',
      payload: __('Delete'),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  isSafeDeleteSupported(data) {
    return data.filter((i) => !i.supports_safe_delete).length === 0;
  }

  render() {
    // eslint-disable-next-line consistent-return
    const renderSpinner = (spinnerOn) => {
      if (spinnerOn) {
        return (
          <div className="loadingSpinner">
            <Loading active small withOverlay={false} className="loading" />
          </div>
        );
      }
    };
    const { modalData } = this.props;
    const { loaded, data, force } = this.state;
    return (
      <ModalBody className="warning-modal-body">
        {renderSpinner(!loaded)}
        {loaded
          && (
            <div>
              <h4>{__(modalData.modal_text)}</h4>
              <ul>
                {data.map((item) => (
                  <li key={item.id}><h4><strong>{item.name}</strong></h4></li>
                ))}
              </ul>
            </div>
          )}
        {modalData.try_safe_delete
        && (
          <label htmlFor="forceCheckbox">
            <input
              name="force"
              type="checkbox"
              id="forceCheckbox"
              checked={force}
              // eslint-disable-next-line no-unused-vars
              onChange={(ev) => {
                this.setState({
                  force: !force,
                });
              }}
              disabled={!this.isSafeDeleteSupported(data)}
              data-toggle="tooltip"
              title={this.isSafeDeleteSupported(data)
                ? ''
                : `Some of the items only support force-delete: ${
                  data.filter((i) => !i.supports_safe_delete).map((i) => i.name)}`}
            />
          &nbsp; Force Delete?
          </label>
        )}
      </ModalBody>
    );
  }
}

RemoveGenericItemModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  recordId: PropTypes.number,
  gridChecks: PropTypes.arrayOf(PropTypes.any),
  modalData: PropTypes.objectOf(PropTypes.any).isRequired,
};

RemoveGenericItemModal.defaultProps = {
  recordId: null,
  gridChecks: null,
};

export default connect()(RemoveGenericItemModal);
