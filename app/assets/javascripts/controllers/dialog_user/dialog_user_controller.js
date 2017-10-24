ManageIQ.angular.app.controller('dialogUserController', ['API', 'dialogFieldRefreshService', 'miqService', 'serviceTemplateId', 'serviceTemplateCatalogId', function(API, dialogFieldRefreshService, miqService, serviceTemplateId, serviceTemplateCatalogId) {
  var vm = this;

  vm.$onInit = function() {
    return new Promise(function(resolve) {
      resolve(API.get('/api/service_templates/' + serviceTemplateId + '/service_dialogs?expand=resources&attributes=content').then(init));
    });
  };

  function init(dialog) {
    vm.dialog = dialog.resources[0].content[0];
  }

  vm.refreshField = refreshField;
  vm.setDialogData = setDialogData;
  vm.refreshUrl = '/api/service_catalogs/' + serviceTemplateCatalogId + '/service_templates/';

  vm.submitButtonClicked = submitButtonClicked;
  vm.cancelClicked = cancelClicked;
  vm.saveable = saveable;

  function refreshField(field) {
    return dialogFieldRefreshService.refreshField(vm.dialogData, [field.name], vm.refreshUrl, serviceTemplateId);
  }

  function setDialogData(data) {
    vm.dialogData = data.data;
  }

  function submitButtonClicked() {
    var url = '/api/service_catalogs/' + serviceTemplateCatalogId + '/service_templates/' + serviceTemplateId;
    vm.dialogData.action = 'order';
    miqService.sparkleOn();
    API.post(url, vm.dialogData).then(function() {
      miqService.redirectBack(__('Service ordered successfully!'), 'info', '/miq_request?typ=service');
    }).catch(function(err) {
      miqService.sparkleOff();
      add_flash(__('Error requesting data from server'), 'error');
      console.log(err);
      return Promise.reject(err);
    });
  }

  function cancelClicked(_event) {
    miqService.miqAjaxButton('/catalog/explorer');
  }

  function saveable() {
    return !dialogFieldRefreshService.areFieldsBeingRefreshed;
  }
}]);
