import React from 'react';
import ReactDOM from 'react-dom';
import { Icon, Modal } from 'patternfly-react';
import { Provider } from 'react-redux';
import FormButtonsRedux from '../forms/form-buttons-redux';

function closeModal(id) {
  /**
   * this should have been div.remove();
   * except patternfly modal does not render itself in its parent element
   * but creates a new one in body, without any id
   * so we're abusing the modal body to provide the id so that we can remove the right div when closing
   * yay
   */

  // FIXME: rewrite it without using jQuery and add some tests
  const divs = $(`#${id}`).parents('div');
  divs[divs.length - 1].remove(); // the div closest to body
}

export default function renderModal(title = __('Modal'), Inner = () => <div>Empty?</div>) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const removeId = 'provider-dialogs';

  const close = () => closeModal(removeId);

  const output = modal(title, Inner, close, removeId);

  ReactDOM.render(output, div);
}

function modal(title, Inner, closed, removeId) {
  const overrides = {
    addClicked: orig => Promise.resolve(orig()).then(closed),
    saveClicked: orig => Promise.resolve(orig()).then(closed),
    cancelClicked: orig => Promise.resolve(orig()).then(closed),
    // don't close on reset
  };

  return (
    <Provider store={ManageIQ.redux.store}>
      <Modal
        show
        onHide={closed}
        onExited={closed}
        id="provider-modal"
      >
        <Modal.Header>
          <button
            type="button"
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
          <div id={/* see closeModal */ removeId} />
        </Modal.Body>
        <Modal.Footer>
          <FormButtonsRedux callbackOverrides={overrides} />
        </Modal.Footer>
      </Modal>
    </Provider>
  );
}
