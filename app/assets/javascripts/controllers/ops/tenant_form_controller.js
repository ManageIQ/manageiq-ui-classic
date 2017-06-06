ManageIQ.angular.app.controller('tenantFormController', ['$http', '$scope', 'tenantFormId', 'tenantType', 'miqService', function($http, $scope, tenantFormId, tenantType, miqService) {
    var vm = this;
    var init = function() {
      vm.tenantModel = {
        name: '',
        description: '',
        divisible: true,
        use_config_for_attributes: false
      };
      vm.formId = tenantFormId;
      vm.afterGet = false;
      vm.validateClicked = miqService.validateWithAjax;
      vm.model = "tenantModel";
      vm.saveable = miqService.saveable;
      ManageIQ.angular.scope = vm;

      if (tenantFormId == 'new') {
        vm.newRecord                             = true;
        vm.tenantModel.name                      = '';
        vm.tenantModel.description               = '';
        vm.tenantModel.default                   = false;
        vm.tenantModel.divisible                 = tenantType;
        vm.tenantModel.use_config_for_attributes = false;

        vm.afterGet  = true;
        vm.modelCopy = angular.copy( vm.tenantModel );
      } else {
        vm.newRecord = false;
        miqService.sparkleOn();
        $http.get('/ops/tenant_form_fields/' + tenantFormId)
          .then(getTenantFormData)
          .catch(miqService.handleFailure);
      }
    };

    var tenantEditButtonClicked = function(buttonName, serializeFields) {
      miqService.sparkleOn();
      var url = '/ops/rbac_tenant_edit/' + tenantFormId + '?button=' + buttonName + '&divisible=' + tenantType;
      if (serializeFields === undefined) {
        miqService.miqAjaxButton(url);
      } else {
        miqService.miqAjaxButton(url, serializeFields);
      }
    };

    vm.cancelClicked = function() {
      tenantEditButtonClicked('cancel');
      $scope.angularForm.$setPristine(true);
    };

    vm.resetClicked = function() {
      vm.tenantModel = angular.copy( vm.modelCopy );
      $scope.angularForm.$setUntouched(true);
      $scope.angularForm.$setPristine(true);
      miqService.miqFlash("warn", __("All changes have been reset"));
    };

    vm.saveClicked = function() {
      tenantEditButtonClicked('save', true);
      $scope.angularForm.$setPristine(true);
    };

    vm.addClicked = function() {
      vm.saveClicked();
    };

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

    init();
}]);
