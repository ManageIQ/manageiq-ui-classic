import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Icon, Modal } from 'patternfly-react';

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
  // TODO
  console.log('TODO dialogModal', arguments);
}

function closeModal(id) {
  // this should have been div.remove();
  // except patternfly modal does not render itself in its parent element
  // but creates a new one in body, without any id
  // so we're abusing the modal body to provide the id so that we can remove the right div when closing
  // yay

  const divs = $('#' + id).parents('div');
  divs[divs.length - 1].remove(); // the div closest to body
}

function renderModal(title = __("Modal"), Inner = () => <div>Empty?</div>) {
  const div = $('<div></div>').appendTo('body');
  const removeId = 'provider-dialogs';

  const close = () => closeModal(removeId);

  const output = modal(title, Inner, close, removeId);

  ReactDOM.render(output, div[0]);
}

function modal(title, Inner, closed, removeId) {
  return (
    <Modal
      show={true}
      onHide={closed}
      onExited={closed}
    >
      <Modal.Header>
        <button
          className="close"
          onClick={closed}
          aria-hidden="true"
          aria-label="Close"
        >
          <Icon type="pf" name="close" />
        </button>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Inner />
        <div id={/* see closeModal */ removeId}></div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          bsStyle="primary"
          onClick={closed}
          autoFocus
        >
          {__('Close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
