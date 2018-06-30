import React from 'react';
import { http, API } from '../http_api';
import sampleDialog from '../provider-dialogs/sample-dialog.json'
import renderModal from '../provider-dialogs/modal'

function call_the_endpoint(buttonData) {
  // return http.get('/controller/action');
  // return http.post('/controller/action', { foo: 'bar' });

  if (buttonData.button === 'magic') {
    return Promise.resolve({
      react: 'CreateAmazonSecurityGroupForm',
      props: {
        providerId: buttonData.ems_id,
      },
    });
  } else if (buttonData.button === 'magic_dialog') {
    // return API.get('/api/service_templates/1/service_dialogs?expand=resources&attributes=content');
    return Promise.resolve({
      dialog: sampleDialog,
    });
  } else {
    console.error('ELSE');  // FIXME
  }
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
  // %dialog-user{"dialog" =>"vm.dialog"}
  const elem = $('<dialog-user></dialog-user>');
  elem.attr('dialog', JSON.stringify(response.dialog));

  const id = 'angular-provider-dialog';

  let inner = class extends React.Component {
    componentDidMount() {
      elem.appendTo(`#${id}`);
      miq_bootstrap(`#${id}`);
    }

    render() {
      return <div id={id}></div>;
    }
  };

  renderModal(__("My dialog-user"), inner);
}
