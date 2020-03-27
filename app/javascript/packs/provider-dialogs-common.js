import React from 'react';
import renderModal from '../provider-dialogs/modal';

ManageIQ.angular.app.component('providerDialogUser', {
  bindings: {
    dialog: '<',
    entityName: '@',
    actionName: '@',
    successMessage: '@',
  },
  template: '<dialog-user dialog="$ctrl.dialog" refresh-field="$ctrl.refreshField(field)" on-update="$ctrl.setDialogData(data)"></dialog-user>',
  controller: [function providerDialogsCommonController() {
    this.formData = {};

    // dynamic fields are not supported in this context
    this.refreshField = () => Promise.resolve({ values: [], options: [] });

    this.setDialogData = (data) => {
      this.formData = data.data;

      ManageIQ.redux.store.dispatch({
        type: 'FormButtons.saveable',
        payload: data.validations.isValid,
      });
    };

    this.$onInit = () => {
      ManageIQ.redux.store.dispatch({
        type: 'FormButtons.init',
        payload: {
          newRecord: true,
          pristine: false,
          addClicked: () => {
            apiCall(
              {
                entity_name: this.entityName,
                action_name: this.actionName,
                success_message: this.successMessage,
              },
              this.formData,
            );
          },
        },
      });
    };
  }],
});

function reactModal(buttonData) {
  const props = {
    recordId: ManageIQ.record.recordId,
    gridChecks: ManageIQ.gridChecks,
    modalData: buttonData
  };

  const Component = ManageIQ.component.getReact(buttonData.component_name);
  const inner = () => <Component {...props} />;

  renderModal(__(buttonData.modal_title), inner);
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

// careful: the dialogDefinigion is string, not an object here
function dialogModal(dialogDefinition, buttonData) {
  const elem = document.createElement('provider-dialog-user');
  elem.setAttribute('dialog', dialogDefinition);
  elem.setAttribute('action-name', buttonData.action_name);
  elem.setAttribute('entity-name', buttonData.entity_name);
  elem.setAttribute('success-message', buttonData.success_message);

  const id = 'angular-provider-dialog';

  const inner = class extends React.Component {
    componentDidMount() {
      document.querySelector(`#${id}`).appendChild(elem);
      miq_bootstrap(`#${id}`);
    }

    render() {
      return <div id={id} />;
    }
  };

  renderModal(buttonData.dialog_title, inner);
}

window.listenToRx((buttonData) => {
  if (!buttonData || buttonData.controller !== 'provider_dialogs') {
    return;
  }

  if (buttonData.component_name) {
    reactModal(buttonData);
  } else if (buttonData.dialog_name) {
    http.post(
      '/dashboard/dialog_definition',
      { class: buttonData.class, name: buttonData.dialog_name },
      { headers: { 'Content-Type': 'application/json' } },
    ).then((response) => {
      if (response.error) {
        add_flash(__('Failed to fetch dialog definition'), 'error');
        return;
      }
      dialogModal(response.dialog, buttonData);
    });
  } else if (buttonData.entity_name) {
    apiCall(buttonData);
  }
});
