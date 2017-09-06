ManageIQ.angular.app.controller('dialogUserController', ['API', 'dialogFieldRefreshService', 'serviceTemplateId', 'serviceTemplateCatalogId', function(API, dialogFieldRefreshService, serviceTemplateId, serviceTemplateCatalogId) {
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

  function refreshField(field) {
    return dialogFieldRefreshService.refreshField(vm.dialogData, [field.name], vm.refreshUrl, serviceTemplateId);
  }

  function setDialogData(data) {
    vm.dialogData = data.data;
  }
}]);
