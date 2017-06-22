ManageIQ.angular.app.component('tenantComponent', {
  bindings: {
    id: '=?',
    divisible: '=',
    parent: '=?',
    angularForm: '=',
    redirectUrl: '@',
  },
  controllerAs: 'vm',
  controller: tenantFormController,
  templateUrl: '/static/ops/tenant/tenant.html.haml',
});

tenantFormController.$inject = ['API', 'miqService'];

/** @ngInject */
function tenantFormController(API, miqService) {
  var vm = this;

  vm.$onInit = function() {
    vm.entity = vm.divisible ? __('Tenant') : __('Project');
    vm.afterGet = false;

    vm.tenantModel = {
      name: '',
      description: '',
      parent: vm.parent,
      use_config_for_attributes: '',
      default: ''
    };

    if (angular.isDefined(vm.id)) {
      vm.newRecord = false;
      miqService.sparkleOn();
      API.get('/api/tenants/' + vm.id)
        .then(getTenantFormData)
        .catch(miqService.handleFailure);
    } else {
      vm.newRecord = true;
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.tenantModel );
    }

    vm.saveClicked = function() {
      miqService.sparkleOn();
      API.put('/api/tenants/' + vm.id, {name: vm.tenantModel.name, description: vm.tenantModel.description})
        .then(miqService.redirectBack.bind(vm, sprintf(__("%s \"%s\" has been successfully saved."), vm.entity, vm.tenantModel.name), 'success', vm.redirectUrl, true))
        .catch(miqService.handleFailure);
    };

    vm.addClicked = function() {
      miqService.sparkleOn();
      API.post('/api/tenants/', {name: vm.tenantModel.name,
                                 description: vm.tenantModel.description,
                                 divisible: vm.divisible,
                                 parent: {id: vm.tenantModel.parent,}})
        .then(miqService.redirectBack.bind(vm, sprintf(__("%s \"%s\" has been successfully added."), vm.entity, vm.tenantModel.name), 'success', vm.redirectUrl, true))
        .catch(miqService.handleFailure);
    };
  };

  // private functions
  function getTenantFormData(response) {
    vm.tenantModel.name                      = response.name;
    vm.tenantModel.description               = response.description;
    vm.tenantModel.default                   = !angular.isDefined(response.ancestry);
    vm.tenantModel.use_config_for_attributes = response.use_config_for_attributes;
    vm.tenantModel.parent                    = response.ancestry;
    vm.tenantModel.divisible                 = response.divisible;

    vm.afterGet = true;
    vm.entity = vm.tenantModel.divisible ? __('Tenant') : __('Project');
    vm.modelCopy = angular.copy( vm.tenantModel );

    miqService.sparkleOff();
  }
}
