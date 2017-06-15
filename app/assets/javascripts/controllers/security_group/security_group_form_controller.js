ManageIQ.angular.app.controller('securityGroupFormController', ['securityGroupFormId', 'miqService', 'API', function(securityGroupFormId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.securityGroupModel = {
      name: "",
      description: "",
      cloud_tenant_name: "",
      firewall_rules: [],
    };
    vm.formId = securityGroupFormId;
    vm.model = "securityGroupModel";
    vm.newRecord = securityGroupFormId === "new";
    vm.saveable = miqService.saveable;

    if (vm.newRecord) {
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.securityGroupModel );
    } else {
      miqService.sparkleOn();
      API.get("/api/security_groups/" + securityGroupFormId + "?attributes=cloud_tenant,firewall_rules").then(function(data) {
        vm.securityGroupModel.name = data.name;
        vm.securityGroupModel.description = data.description;
        vm.securityGroupModel.cloud_tenant_name = data.cloud_tenant.name;
        vm.securityGroupModel.firewall_rules = data.firewall_rules;
        vm.afterGet = true;
        vm.modelCopy = angular.copy( vm.securityGroupModel );
      }).catch(miqService.handleFailure);
      miqService.sparkleOff();
    }
  };

  vm.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, vm.securityGroupModel, { complete: false });
  };

  vm.cancelClicked = function() {
    if (vm.newRecord) {
      var url = '/security_group/create/new' + '?button=cancel';
    } else {
      var url = '/security_group/update/' + securityGroupFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = '/security_group/update/' + securityGroupFormId + '?button=save';
    miqService.miqAjaxButton(url, vm.securityGroupModel, { complete: false });
  };

  vm.resetClicked = function(angularForm) {
    vm.securityGroupModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  vm.filterNetworkManagerChanged = miqService.getProviderTenants(function(data) {
    vm.available_tenants = data.resources;
  });

  init();
}]);
