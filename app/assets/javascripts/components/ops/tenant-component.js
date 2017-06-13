ManageIQ.angular.app.component('tenantComponent', {
  bindings: {
    id: '=?',
    parent: '=?',
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

    vm.resetClicked = function(angularForm) {
      vm.tenantModel = angular.copy(vm.modelCopy );
      angularForm.$setUntouched(true);
      angularForm.$setPristine(true);
      miqService.miqFlash("warn", __("All changes have been reset"));
    };

    vm.cancelClicked = function(angularForm) {
      tenantEditButtonClicked('cancel');
      angularForm.$setPristine(true);
    };

    vm.saveClicked = function(angularForm) {
      tenantEditButtonClicked('save', true);
      angularForm.$setPristine(true);
    };

    vm.addClicked = function(angularForm) {
      vm.saveClicked(angularForm);
    };
  };

  // private functions
  function getTenantFormData(response) {
    vm.tenantModel.name                      = response.name;
    vm.tenantModel.description               = response.description;
    vm.tenantModel.default                   = !angular.isDefined(response.ancestry);
    vm.tenantModel.use_config_for_attributes = response.use_config_for_attributes;
    vm.tenantModel.parent                    = response.ancestry;

    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.tenantModel );

    miqService.sparkleOff();
  }
}
