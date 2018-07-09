import React from 'react';
import renderModal from '../provider-dialogs/modal'

window.listenToRx(function(buttonData) {
  if (!buttonData || buttonData.controller !== 'provider_dialogs') {
    return;
  }

  if (! buttonData.component_name) {
    console.error('provider-dialogs: missing component_name', buttonData);
    return;
  }

  reactModal(buttonData);
});

function reactModal(buttonData) {
  const props = {
    recordId: ManageIQ.record.recordId,
  };

  let Component = ManageIQ.component.getReact(buttonData.component_name);
  let inner = () => <Component {...props} />;

  renderModal(__(buttonData.modal_title), inner);
}
