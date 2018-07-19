import React from 'react';
import renderModal from '../provider-dialogs/modal';

function reactModal(buttonData) {
  const props = {
    recordId: ManageIQ.record.recordId,
  };

  const Component = ManageIQ.component.getReact(buttonData.component_name);
  const inner = () => <Component {...props} />;

  renderModal(__(buttonData.modal_title), inner);
}

function apiCall(buttonData) {
  const url = '/' + buttonData.entity_name + '/' + ManageIQ.record.recordId;

  API.post(url, { action: buttonData.action_name }).then(function(response) {

    let errorMessage;

    if (response.error) {
      if (response.error.message) {
        errorMessage = response.error.message;
      } else {
        errorMessage = __('An unknown error has occurred.');
      }
      add_flash(errorMessage, 'error');
    }
    add_flash(buttonData.success_message, 'success');
  });
}

window.listenToRx(function (buttonData) {
  if (!buttonData || buttonData.controller !== 'provider_dialogs') {
    return;
  }

  if (buttonData.entity_name) {
    apiCall(buttonData);
  } else if (buttonData.component_name) {
    // console.error('provider-dialogs: missing component_name', buttonData);
    reactModal(buttonData);
  }
});

