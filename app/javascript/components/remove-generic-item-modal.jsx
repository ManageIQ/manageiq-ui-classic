/* eslint-disable camelcase */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Loading, ModalBody } from '@carbon/react';
import { API } from '../http_api';
import miqRedirectBack from '../helpers/miq-redirect-back';
import { setLocationHref } from '../helpers/window-location';

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
    // eslint-disable-next-line no-prototype-builtins
    if (error.data.hasOwnProperty('error')) {
      return error.data.error.message;
    }
    return error.data.message;
  // eslint-disable-next-line no-prototype-builtins
  } if (error.hasOwnProperty('message')) {
    return error.message;
  }
};

export const removeItems = (items, force, {
  ajaxReload, apiUrl, asyncDelete, redirectUrl, treeSelect,
}) => {
  const apiPromises = [];
  const deleteMessage = asyncDelete ? __('Deletion of item %s has been successfully initiated') : __('The item "%s" has been successfully deleted');

  miqSparkleOn();
  if (force) {
    items.forEach((item) => {
      apiPromises.push(API.post(`/api/${apiUrl}/${item.id}`, { action: 'delete' }, { skipErrors: [400, 500] })
        .then((apiResult) => {
          if (apiUrl === 'generic_object_definitions') {
            const message = sprintf(__(`Generic object definition %s was successfully deleted`), item.name);
            miqRedirectBack(message, 'success', redirectUrl);
            return null;
          }
          return { result: apiResult.success ? 'success' : 'error', data: apiResult, name: item.name };
        })
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
      if (apiData[0] != null) {
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
      }
      return null;
    })
    .then((apiData) => {
      if (apiData) {
        if (items.length > 1 || (items.length === 1 && apiData[0].result === 'success')) {
          if (!treeSelect && !ajaxReload) {
            setLocationHref(redirectUrl);
            miqSparkleOff();
          } else {
            sendDataWithRx({ type: 'gtlUnselectAll' });
            miqAjax(treeSelect ? `tree_select?id=${treeSelect}` : `reload?deleted=true`)
              // eslint-disable-next-line no-undef
              .then(() => miqFlashSaved());
          }
        }
      }
    });
};

function RemoveGenericItemModal({
  recordId = null,
  gridChecks = null,
  modalData,
}) {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [force, setForce] = useState(false);

  const isSafeDeleteSupported = (items) => items.filter((i) => !i.supports_safe_delete).length === 0;

  useEffect(() => {
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

    let extra_attributes = '';
    if (modalData.try_safe_delete) {
      extra_attributes += '/?attributes=supports_safe_delete';
    }

    Promise.all(itemsIds.map((item) => API.get(`/api/${api_url}/${item}${extra_attributes}`)))
      .then((apiData) => apiData.map((item) => transformFn(item, { display_field })))
      .then((loadedData) => {
        setData(loadedData);
        setForce(!isSafeDeleteSupported(loadedData));
        setLoaded(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-register the delete button handler whenever data or force changes so
  // addClicked always closes over the up-to-date loaded values, not the initial state.
  useEffect(() => {
    const {
      ajax_reload,
      api_url,
      async_delete,
      redirect_url,
      tree_select,
    } = modalData;

    dispatch({
      type: 'FormButtons.init',
      payload: {
        newRecord: true,
        pristine: true,
        customLabel: __('Delete'),
        addClicked: () => removeItems(data, force, {
          ajaxReload: ajax_reload,
          apiUrl: api_url,
          asyncDelete: async_delete,
          redirectUrl: redirect_url,
          treeSelect: tree_select,
        }),
      },
    });
    if (data.length > 0) {
      dispatch({ type: 'FormButtons.saveable', payload: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, force]);

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
            onChange={() => setForce((prev) => !prev)}
            disabled={!isSafeDeleteSupported(data)}
            data-toggle="tooltip"
            title={isSafeDeleteSupported(data)
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

RemoveGenericItemModal.propTypes = {
  recordId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  gridChecks: PropTypes.arrayOf(PropTypes.any),
  modalData: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default RemoveGenericItemModal;
