import { useEffect, useState } from 'react';
import { Modal, ModalBody } from '@carbon/react';
import { MisuseOutline } from '@carbon/react/icons';
import DOMPurify from 'dompurify';

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

const MiqErrorModal = () => {
  const [show, setShow] = useState(false);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    const subscription = window.listenToRx((event) => {
      if ('serverError' in event) {
        const details = buildErrorDetails({
          error: event.serverError,
          source: event.source,
          backendName: event.backendName,
        });
        setError(details);
        setShow(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
      onRequestClose={() => setShow(false)}
    >
      <ModalBody className="miq-error-modal-body">
        <div className="miq-error-modal-icon">
          <MisuseOutline />
        </div>
        <div className="miq-error-modal-details">
          {url && (
            <p className="miq-error-modal-row">
              <strong className="miq-error-modal-label">{__('URL')}</strong>
              {url}
            </p>
          )}
          {status && (
            <p className="miq-error-modal-row">
              <strong className="miq-error-modal-label">{__('Status')}</strong>
              {status}
            </p>
          )}
          {contentType && (
            <p className="miq-error-modal-row">
              <strong className="miq-error-modal-label">{__('Content-Type')}</strong>
              {contentType}
            </p>
          )}
          {data && (
            <p className="miq-error-modal-row">
              <strong className="miq-error-modal-label">{__('Data')}</strong>
              <span
                className="miq-error-modal-data"
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
