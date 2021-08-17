import React from 'react';
import renderModal from '../provider-dialogs/modal';

function reactModal(buttonData) {
  const props = {
    recordId: ManageIQ.record.recordId,
    gridChecks: ManageIQ.gridChecks,
    modalData: buttonData,
  };

  const Component = ManageIQ.component.getReact(buttonData.component_name);
  const inner = () => <Component {...props} />;
  const noop = () => {};
  const closefunc = (Component.WrappedComponent && Component.WrappedComponent.defaultProps && Component.WrappedComponent.defaultProps.closefunc)
    ? Component.WrappedComponent.defaultProps.closefunc : noop;
  renderModal(__(buttonData.modal_title), inner, closefunc);
}

function apiCall(buttonData, dialogData) {
  const url = `/api/${buttonData.entity_name}/${ManageIQ.record.recordId}`;
  API.post(url, { action: buttonData.action_name, data: dialogData }).then((response) => {
    let errorMessage;

    if (response.error) {
      if (response.error.message) {
        errorMessage = response.error.message;
      } else {
        errorMessage = __('An unknown error has occurred.');
      }
      add_flash(errorMessage, 'error');
      return;
    }
    add_flash(__(buttonData.success_message), 'success');
  }).catch(() => {
    add_flash(__('An unknown error has occurred calling the API.'));
  });
}

window.listenToRx((buttonData) => {
  if (!buttonData || buttonData.controller !== 'provider_dialogs') {
    return;
  }

  if (buttonData.component_name) {
    reactModal(buttonData);
  } else if (buttonData.entity_name) {
    apiCall(buttonData);
  }
});
