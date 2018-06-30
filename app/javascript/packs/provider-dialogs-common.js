import React from 'react';
import renderModal from '../provider-dialogs/modal'

function call_the_endpoint(buttonData) {
  return Promise.resolve({
    react: 'CreateAmazonSecurityGroupForm',
    props: {
      providerId: buttonData.ems_id,
    },
  });
}

window.listenToRx(function(buttonData) {
  if (!buttonData || buttonData.controller !== 'provider_dialogs') {
    return;
  }

  call_the_endpoint(buttonData)
    .then(function(response) {
      if (response.react) {
        reactModal(buttonData, response);
      } else if (response.dialog) {
        dialogModal(buttonData, response);
      } else {
        console.error('provider-dialogs: surprising response', buttonData, response);
      }
    });
});

function reactModal(buttonData, response) {
  let Component = ManageIQ.component.getReact(response.react);
  let inner = () => <Component {...response.props} />;

  renderModal(__("My React Modal"), inner);
}

function dialogModal(buttonData, response) {
  console.log('TODO dialogModal', arguments);

  // %dialog-user{"dialog" =>"vm.dialog"}
  const elem = $('<dialog-user></dialog-user>');
  elem.attr('dialog', JSON.stringify(response.dialog));

  const id = 'angular-provider-dialog';

  let inner = () => {
    // TODO react component lifecycle instead of setTimeout?
    setTimeout(() => {
      elem.appendTo(`#${id}`);
      miq_bootstrap(`#${id}`);
    });

    return <div id={id}></div>;
  };

  renderModal(__("My dialog-user"), inner);
}
