ManageIQ.angular.app.controller('tenantQuotaFormController', ['$http', '$scope', 'tenantQuotaFormId', 'tenantType', 'miqService', function($http, $scope, tenantQuotaFormId, tenantType, miqService) {
  var vm = this;
  var init = function() {
    vm.tenantQuotaModel = {
      name: '',
      quotas: {},
    };
    vm.formId = tenantQuotaFormId;
    vm.afterGet = false;
    vm.modelCopy = angular.copy( vm.tenantQuotaModel );
    vm.model = 'tenantQuotaModel';

    ManageIQ.angular.scope = vm;
    vm.newRecord = false;
    miqService.sparkleOn();
    $http.get('/ops/tenant_quotas_form_fields/' + tenantQuotaFormId)
      .then(getTenantQuotaData)
      .catch(miqService.handleFailure);
  };

  var tenantManageQuotasButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = '/ops/rbac_tenant_manage_quotas/' + tenantQuotaFormId + '?button=' + buttonName + '&divisible=' + tenantType;
    if (serializeFields === undefined) {
      miqService.miqAjaxButton(url);
    } else {
      miqService.miqAjaxButton(url, serializeFields);
    }
  };

  $scope.cancelClicked = function() {
    tenantManageQuotasButtonClicked('cancel');
    $scope.angularForm.$setPristine(true);
  };

  $scope.resetClicked = function() {
    vm.tenantQuotaModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  $scope.saveClicked = function() {
    var data = {};
    var GIGABYTE = 1024 * 1024 * 1024;
    for (var key in vm.tenantQuotaModel.quotas) {
      if (vm.tenantQuotaModel.quotas.hasOwnProperty(key)) {
        var quota =  vm.tenantQuotaModel.quotas[key];
        if (quota.value) {
          var q = {};
          if (quota.unit === 'bytes') {q.value = quota.value * GIGABYTE;} else {q.value = quota.value;}
          data[key] = q;
        }
      }
    }
    tenantManageQuotasButtonClicked('save', { 'quotas': data});
  };

  vm.check_quotas_changed = function() {
    for (var key in vm.tenantQuotaModel.quotas) {
      if (vm.tenantQuotaModel.quotas.hasOwnProperty(key)) {
        if (vm.tenantQuotaModel.quotas[key].value != vm.modelCopy.quotas[key].value) {return true;}
      }
    }
    return false;
  };

  vm.enforcedChanged = function(name) {
    miqService.miqFlashClear();
    for ( var key in vm.tenantQuotaModel.quotas ) {
      if (vm.tenantQuotaModel.quotas.hasOwnProperty(key) && (key == name)) {
        if (! vm.tenantQuotaModel.quotas[key].enforced) {vm.tenantQuotaModel.quotas[key].value = null;} else
        if (vm.modelCopy.quotas[key].value) {vm.tenantQuotaModel.quotas[key].value = vm.modelCopy.quotas[key].value;} else {vm.tenantQuotaModel.quotas[key].value = 0;}
        if (! vm.check_quotas_changed()) {$scope.angularForm.$setPristine(true);}
      }
    }
  };

  vm.valueChanged = function() {
    miqService.miqFlashClear();
    if (! vm.check_quotas_changed()) {$scope.angularForm.$setPristine(true);}
  };

  function getTenantQuotaData(response) {
    var data = response.data;

    vm.tenantQuotaModel.name = data.name;
    vm.tenantQuotaModel.quotas = angular.copy(data.quotas);
    var GIGABYTE = 1024 * 1024 * 1024;
    for (var key in vm.tenantQuotaModel.quotas) {
      if (vm.tenantQuotaModel.quotas.hasOwnProperty(key)) {
        var quota =  vm.tenantQuotaModel.quotas[key];
        if (quota.value) {
          if (quota.unit === 'bytes') {
            quota.value = quota.value / GIGABYTE;
          }
          quota.enforced = true;
        } else {
          quota.enforced = false;
        }

        if (quota.format === 'general_number_precision_0') {
          quota.valpattern = '^[1-9][0-9]*$';
        } else {
          quota.valpattern = /^\s*(?=.*[1-9])\d*(?:\.\d{1,6})?\s*$/;
        }
      }
    }
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.tenantQuotaModel );
    miqService.sparkleOff();
  }

  init();
}]);
