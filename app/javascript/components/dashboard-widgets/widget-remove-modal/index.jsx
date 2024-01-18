import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'carbon-components-react';
import miqRedirectBack from '../../../helpers/miq-redirect-back';

const WidgetRemoveModal = ({
  showConfirm, setState, widgetTitle, href,
}) => (
  <Modal
    open={showConfirm}
    primaryButtonText={__('OK')}
    secondaryButtonText={__('Cancel')}
    onRequestClose={() => {
      setState((state) => ({
        ...state,
        showConfirm: false,
      }));
    }}
    onRequestSubmit={() => {
      http.post(href, {}, { skipErrors: true })
        .then((result) => {
          miqRedirectBack(result.message, 'success', '/dashboard/');
        })
        .catch((result) => miqRedirectBack(result.message, 'warning', '/dashboard/'));
    }}
    onSecondarySubmit={() => {
      setState((state) => ({
        ...state,
        showConfirm: false,
      }));
    }}
  >
    {sprintf(__(`Are you sure you want to remove %s from the Dashboard?`), widgetTitle)}
  </Modal>
);

WidgetRemoveModal.propTypes = {
  showConfirm: PropTypes.bool,
  setState: PropTypes.func.isRequired,
  widgetTitle: PropTypes.string.isRequired,
  href: PropTypes.string,
};

WidgetRemoveModal.defaultProps = {
  showConfirm: false,
  href: '',
};

export default WidgetRemoveModal;
