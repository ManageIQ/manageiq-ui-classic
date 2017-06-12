ManageIQ.angular.app.component('tenantComponent', {
  bindings: {
    id: '=?',
    parent: '=?',
  },
  controllerAs: 'vm',
  controller: tenantFormController,
  templateUrl: '/static/ops/tenant/tenant.html.haml',
});

tenantFormController.$inject = ['$http', 'miqService'];

/** @ngInject */
function tenantFormController($http, miqService) {
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
      $http.get('/ops/tenant_form_fields/' + vm.id)
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
    var data = response.data;

    vm.tenantModel.name                      = data.name;
    vm.tenantModel.description               = data.description;
    vm.tenantModel.default                   = data.default;
    vm.tenantModel.divisible                 = data.divisible;
    vm.tenantModel.use_config_for_attributes = data.use_config_for_attributes;

    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.tenantModel );

    miqService.sparkleOff();
  }
}
