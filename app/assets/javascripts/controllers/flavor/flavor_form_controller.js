ManageIQ.angular.app.controller('flavorFormController', ['$http', 'flavorId', 'miqService', 'API', function($http, flavorId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.flavorModel = {
      name: '',
      ram: '',
      vcpus: '',
      disk: '',
      swap: '',
      rxtx_factor: '1.0',
      is_public: true,
      ems_id: '',
      cloud_tenant_refs: [],
    };

    vm.model = 'flavorModel';
    vm.ems_list = [];
    vm.cloudTenants = [];
    vm.selectedCloudTenants = [];

    vm.newRecord = flavorId === 'new';
    vm.saveable = miqService.saveable;

    vm.modelCopy = angular.copy(vm.flavorModel);

    $http.get('/flavor/ems_list')
      .then(getEmsFormDataComplete)
      .catch(miqService.handleFailure);

    $http.get('/flavor/cloud_tenants')
      .then(getCloudTenantFormDataComplete)
      .catch(miqService.handleFailure);

    setForm();
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var message = __('Add of Flavor cancelled by user.');
    var url = '/flavor/show_list';
    miqService.redirectBack(message, 'warn', url);
  };

  vm.addClicked = function() {
    miqService.sparkleOn();
    setCloudTenantRefs();
    API.post('/api/providers/' + vm.flavorModel.ems.id + '/flavors', vm.flavorModel)
      .then(getBack)
      .catch(miqService.handleFailure);
  };

  function setForm() {
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  function onError(response) {
    var url = '/flavor/show_list';
    var message = __('Unable to add Flavor ') + vm.flavorModel.name + ' .' + response.results[0].message;
    miqService.redirectBack(message, 'error', url);
    miqService.sparkleOff();
  }

  function nonError() {
    var url = '/flavor/show_list';
    var message = sprintf(__('Add of Flavor "%s" was successfully initialized.'), vm.flavorModel.name);
    miqService.redirectBack(message, 'success', url);
  }

  var getBack = function(response) {
    var err = false;
    if (response.hasOwnProperty('results')) {
      err = !response.results[0].success;
    }

    if (err) {
      onError(response);
    } else {
      nonError();
    }
  };

  function getEmsFormDataComplete(response) {
    vm.ems_list = response.data.ems_list;
    if (foundEms()) {
      setEms();
    }
  }

  function getCloudTenantFormDataComplete(response) {
    vm.cloudTenants = response.data.cloud_tenants;
  }

  function setCloudTenantRefs() {
    for (var i = 0; i < vm.selectedCloudTenants.length; i++) {
      vm.flavorModel.cloud_tenant_refs.push(vm.selectedCloudTenants[i].ems_ref);
    }
  }

  function foundEms() {
    return vm.ems_list.length > 0;
  }

  function setEms() {
    vm.flavorModel.ems = vm.ems_list[0];
  }

  init();
}]);
