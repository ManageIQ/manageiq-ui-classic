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
    let formData = {};

    // dynamic fields are not supported in this context
    this.refreshField = () => Promise.resolve({ values: [], options: [] });

    this.setDialogData = (data) => {
      formData = data.data;

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
  const elem = $('<provider-dialog-user></provider-dialog-user>');
  elem.attr('dialog', dialogDefinition);
  elem.attr('action-name', buttonData.action_name);
  elem.attr('entity-name', buttonData.entity_name);
  elem.attr('success-message', buttonData.success_message);

  const id = 'angular-provider-dialog';

  const inner = class extends React.Component {
    componentDidMount() {
      elem.appendTo(`#${id}`);
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

