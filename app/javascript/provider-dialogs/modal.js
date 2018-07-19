import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Icon, Modal } from 'patternfly-react';
import { Provider } from 'react-redux';
import FormButtonsRedux from '../forms/form-buttons-redux';

function closeModal(id) {
  // this should have been div.remove();
  // except patternfly modal does not render itself in its parent element
  // but creates a new one in body, without any id
  // so we're abusing the modal body to provide the id so that we can remove the right div when closing
  // yay

  const divs = $('#' + id).parents('div');
  divs[divs.length - 1].remove(); // the div closest to body
}

export default function renderModal(title = __("Modal"), Inner = () => <div>Empty?</div>) {
  const div = $('<div></div>').appendTo('body');
  const removeId = 'provider-dialogs';

  const close = () => closeModal(removeId);

  const output = modal(title, Inner, close, removeId);

  ReactDOM.render(output, div[0]);
}

function modal(title, Inner, closed, removeId) {
  const overrides = {
    addClicked: function(orig) {
      Promise.resolve(orig()).then(closed);
    },
    saveClicked: function(orig) {
      Promise.resolve(orig()).then(closed);
    },
    cancelClicked: function(orig) {
      Promise.resolve(orig()).then(closed);
    },
    // don't close on reset
  };

  return (
    <Provider store={ManageIQ.redux.store}>
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
          <FormButtonsRedux callbackOverrides={overrides} />
        </Modal.Footer>
      </Modal>
    </Provider>
  );
}
