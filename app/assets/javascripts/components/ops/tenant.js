ManageIQ.angular.app.component('tenantForm', {
  bindings: {
    recordId: '@?',
    divisible: '=',
    ancestry: '@?',
    redirectUrl: '@',
  },
  controllerAs: 'vm',
  controller: tenantFormController,
  templateUrl: '/static/ops/tenant/tenant.html.haml',
});

tenantFormController.$inject = ['API', 'miqService', '$http'];

function tenantFormController(API, miqService, $http) {
  var vm = this;

  vm.$onInit = function() {
    vm.entity = vm.divisible ? __('Tenant') : __('Project');
    vm.saveable = miqService.saveable;
    vm.afterGet = false;

    vm.tenantModel = {
      name: '',
      description: '',
      ancestry: vm.ancestry,
      use_config_for_attributes: '',
      default: '',
    };

    if (vm.recordId) {
      vm.newRecord = false;
      miqService.sparkleOn();
      API.get('/api/tenants/' + vm.recordId)
        .then(getTenantFormData)
        .catch(miqService.handleFailure);
    } else {
      vm.newRecord = true;
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.tenantModel );
    }
  };

  vm.saveClicked = function() {
    var saveObject = {
      name: vm.tenantModel.name,
      description: vm.tenantModel.description,
      use_config_for_attributes: vm.tenantModel.use_config_for_attributes,
    };
    var saveMsg = sprintf(__('%s "%s" has been successfully saved.'), vm.entity, vm.tenantModel.name);
    vm.saveWithAPI('put', '/api/tenants/' + vm.recordId, saveObject, saveMsg);
  };

  vm.addClicked = function() {
    var saveObject = {
      name: vm.tenantModel.name,
      description: vm.tenantModel.description,
      divisible: vm.divisible,
      parent: { id: vm.tenantModel.ancestry },
    };
    var saveMsg = sprintf(__('%s "%s" has been successfully added.'), vm.entity, vm.tenantModel.name);
    vm.saveWithAPI('post', '/api/tenants/', saveObject, saveMsg);
  };

  vm.saveWithAPI = function(method, url, saveObject, saveMsg) {
    miqService.sparkleOn();
    API[method](url, saveObject, {
      skipErrors: [400],  // server-side validation
    })
      .then(function() {
        return $http.post('/ops/invalidate_miq_product_feature_caches', {});
      })
      .then(miqService.redirectBack.bind(vm, saveMsg, 'success', vm.redirectUrl))
      .catch(miqService.handleFailure);
  };

  vm.resetClicked = function(angularForm) {
    vm.tenantModel = angular.copy(vm.modelCopy);
    angularForm.$setUntouched(true);
    angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    if (vm.newRecord) {
      miqService.redirectBack(sprintf(__('Creation of new %s was canceled by the user.'), vm.entity), 'warning', vm.redirectUrl);
    } else {
      miqService.redirectBack(sprintf(__('Edit of %s "%s" was canceled by the user.'), vm.entity, vm.tenantModel.name), 'warning', vm.redirectUrl);
    }
  };

  vm.changeUseConfigForAttributes = function() {
    if (vm.tenantModel.use_config_for_attributes) {
      vm.tenantModel.name = vm.modelCopy.name;
    }
  };

  // private functions
  function getTenantFormData(response) {
    Object.assign(vm.tenantModel, response);
    vm.tenantModel.default = !response.ancestry;

    vm.afterGet = true;
    vm.entity = vm.tenantModel.divisible ? __('Tenant') : __('Project');
    vm.modelCopy = angular.copy( vm.tenantModel );

    miqService.sparkleOff();
  }
}
