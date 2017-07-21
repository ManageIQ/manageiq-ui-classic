ManageIQ.angular.app.component('tenantComponent', {
  bindings: {
    recordId: '=?',
    divisible: '=',
    parent: '=?',
    redirectUrl: '@',
  },
  controllerAs: 'vm',
  controller: tenantFormController,
  templateUrl: '/static/ops/tenant/tenant.html.haml',
});

tenantFormController.$inject = ['API', 'miqService'];

function tenantFormController(API, miqService) {
  var vm = this;

  vm.$onInit = function() {
    vm.entity = vm.divisible ? __('Tenant') : __('Project');
    vm.saveable = miqService.saveable;
    vm.afterGet = false;

    vm.tenantModel = {
      name: '',
      description: '',
      parent: vm.parent,
      use_config_for_attributes: '',
      default: '',
    };

    if (angular.isDefined(vm.recordId)) {
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
    miqService.sparkleOn();
    API.put('/api/tenants/' + vm.recordId, {name: vm.tenantModel.name, description: vm.tenantModel.description})
      .then(miqService.redirectBack.bind(vm, sprintf(__('%s \"%s\" has been successfully saved.'), vm.entity, vm.tenantModel.name), 'success', vm.redirectUrl, true))
      .catch(miqService.handleFailure);
  };

  vm.addClicked = function() {
    miqService.sparkleOn();
    API.post('/api/tenants/', {
      name: vm.tenantModel.name,
      description: vm.tenantModel.description,
      divisible: vm.divisible,
      parent: { id: vm.tenantModel.parent }}
    )
      .then(miqService.redirectBack.bind(vm, sprintf(__('%s \"%s\" has been successfully added.'), vm.entity, vm.tenantModel.name), 'success', vm.redirectUrl, true))
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
      miqService.redirectBack(sprintf(__('Edit of %s \"%s\" was canceled by the user.'), vm.entity, vm.tenantModel.name), 'warning', vm.redirectUrl);
    }
  };

  // private functions
  function getTenantFormData(response) {
    vm.tenantModel.name                      = response.name;
    vm.tenantModel.description               = response.description;
    vm.tenantModel.default                   = ! angular.isDefined(response.ancestry);
    vm.tenantModel.use_config_for_attributes = response.use_config_for_attributes;
    vm.tenantModel.parent                    = response.ancestry;
    vm.tenantModel.divisible                 = response.divisible;

    vm.afterGet = true;
    vm.entity = vm.tenantModel.divisible ? __('Tenant') : __('Project');
    vm.modelCopy = angular.copy( vm.tenantModel );

    miqService.sparkleOff();
  }
}
