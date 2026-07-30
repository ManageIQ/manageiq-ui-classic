import { useEffect } from 'react';
import { Modal, ModalBody } from '@carbon/react';
import { MisuseOutline } from '@carbon/react/icons';
import DOMPurify from 'dompurify';
import { useMiqDispatch, useMiqSelector } from '../../redux/miq-hooks';

const SHOW_ERROR_MODAL = '@@errorModal/show';
const HIDE_ERROR_MODAL = '@@errorModal/hide';
const LOAD_ERROR_MODAL = '@@errorModal/load';

const showModal = (data) => (dispatch) => {
  dispatch({ type: LOAD_ERROR_MODAL, data });
  dispatch({ type: SHOW_ERROR_MODAL });
};

const findError = (data) => {
  if (!data) {
    return data;
  }

  let match = data.match(/<h2>\s*Error text:\s*<\/h2>\s*<br>\s*<h3>\s*(.*?)\s*<\/h3>/);
  if (match) {
    return match[1];
  }

  match = data.match(/\\u003ch2\\u003e\\nError text:\\n\\u003c\/h2\\u003e\\n\\u003cbr\\u003e\\n\\u003ch3\\u003e\\n(.*?)\\n\\u003c\/h3\\u003e/);
  if (match) {
    return match[1];
  }

  return data;
};

const buildErrorDetails = ({ backendName, error, source }) => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const {
    config,
    data: rawData,
    headers,
    status: errorStatus,
    statusText,
    url: errorUrl,
  } = error;

  let contentType;
  let url;
  let status;

  if (source === 'fetch') {
    contentType = headers?.get('content-type');
    url = errorUrl;
  } else if (source === '$http') {
    contentType = headers?.('content-type');
    url = config?.url;
  } else if (source === 'server') {
    url = errorUrl;
  }

  let data = rawData;
  const isHtml = (contentType || '').match('text/html');

  if (isHtml && data) {
    data = findError(data);
  }

  if (source !== 'server') {
    status = errorStatus !== -1 ? `${errorStatus} ${statusText}` : __('Server not responding');
  }

  return {
    backendName,
    contentType,
    data,
    source,
    status,
    url,
  };
};

ManageIQ.redux.addReducer({
  ErrorModal: function ErrorModalReducer(state = { show: false }, action) {
    switch (action.type) {
      case SHOW_ERROR_MODAL:
        return { ...state, show: true };
      case HIDE_ERROR_MODAL:
        return { ...state, show: false };
      case LOAD_ERROR_MODAL:
        return { ...state, error: action.data };
      default:
        return state;
    }
  },
});

const MiqErrorModal = () => {
  const dispatch = useMiqDispatch();
  const show = useMiqSelector((state) => state.ErrorModal?.show ?? false);
  const error = useMiqSelector((state) => state.ErrorModal?.error);

  useEffect(() => {
    const subscription = window.listenToRx((event) => {
      if ('serverError' in event) {
        dispatch(showModal(buildErrorDetails({
          error: event.serverError,
          source: event.source,
          backendName: event.backendName,
        })));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  if (!show || !error) {
    return null;
  }

  const {
    backendName, contentType, data, status, url,
  } = error;

  return (
    <Modal
      open
      modalHeading={sprintf(__('Server Error %s'), backendName ? `(${backendName})` : '')}
      passiveModal
      className="miq-error-modal"
      onRequestClose={() => dispatch({ type: HIDE_ERROR_MODAL })}
    >
      <ModalBody className="miq-error-modal__body">
        <div className="miq-error-modal__icon">
          <MisuseOutline />
        </div>
        <div className="miq-error-modal__details">
          {url && (
            <p className="miq-error-modal__row">
              <strong className="miq-error-modal__label">{__('URL')}</strong>
              {url}
            </p>
          )}
          {status && (
            <p className="miq-error-modal__row">
              <strong className="miq-error-modal__label">{__('Status')}</strong>
              {status}
            </p>
          )}
          {contentType && (
            <p className="miq-error-modal__row">
              <strong className="miq-error-modal__label">{__('Content-Type')}</strong>
              {contentType}
            </p>
          )}
          {data && (
            <p className="miq-error-modal__row">
              <strong className="miq-error-modal__label">{__('Data')}</strong>
              <span
                className="miq-error-modal__data"
                /* eslint-disable-next-line react/no-danger */
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(String(data)) }}
              />
            </p>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default MiqErrorModal;
