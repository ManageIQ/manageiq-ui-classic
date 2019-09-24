ManageIQ.angular.app.controller('cloudObjectStoreContainerFormController', ['miqService', 'API', 'storageManagerId', function(miqService, API, storageManagerId) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;
    vm.cloudContainerModel = {
      name: '',
      emstype: '',
      parent_emstype: '',
      provider_region: '',
    };

    // fetch StorageManager from querystring
    vm.cloudContainerModel.storage_manager_id = storageManagerId;

    vm.model = 'cloudContainerModel';
    vm.newRecord = true;

    ManageIQ.angular.form = $scope.angularForm;
    vm.saveable = miqService.saveable;

    miqService.sparkleOn();
    API.get('/api/providers?expand=resources&attributes=id,name,supports_cloud_object_store_container_create&filter[]=supports_cloud_object_store_container_create=true')
      .then(getStorageManagers)
      .catch(miqService.handleFailure);

    setForm();
  };

  vm.addClicked = function() {
    var url = 'create' + '?button=add';
    miqService.miqAjaxButton(url, vm.cloudContainerModel, { complete: false });
  };

  vm.cancelClicked = function() {
    miqService.miqAjaxButton('/cloud_object_store_container/create?button=cancel');
  };

  vm.storageManagerChanged = function(id) {
    miqService.sparkleOn();

    API.get('/api/providers/' + id + '?attributes=type,parent_manager.type')
      .then(getStorageManagerFormData)
      .catch(miqService.handleFailure);
  };

  function getStorageManagerFormData(data) {
    vm.afterGet = true;
    vm.cloudContainerModel.emstype = data.type;
    vm.cloudContainerModel.parent_emstype = data.parent_manager.type;

    miqService.sparkleOff();
  }

  function setForm() {
    vm.modelCopy = angular.copy(vm.cloudContainerModel);
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  function getStorageManagers(data) {
    vm.storageManagers = data.resources;

    // If storage manager ID was provided, we need to refresh the form and show
    // corresponding form fields.
    if (storageManagerId) {
      vm.storageManagerChanged(vm.cloudContainerModel.storage_manager_id);
    }
  }

  init();
}]);
