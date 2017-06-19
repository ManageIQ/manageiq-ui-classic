ManageIQ.angular.app.controller('securityGroupFormController', ['securityGroupFormId', 'miqService', 'API', function(securityGroupFormId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;
    vm.securityGroupModel = {
      name: "",
      description: "",
      cloud_tenant_name: "",
      firewall_rules: [],
    };

    getSecurityGroups();
    vm.hostProtocols = ["", "TCP", "UDP", "ICMP"];
    vm.networkProtocols = ["IPV4", "IPV6"];
    vm.directions = ["inbound", "outbound"];

    vm.formId = securityGroupFormId;
    vm.model = "securityGroupModel";
    vm.newRecord = securityGroupFormId === "new";
    vm.saveable = miqService.saveable;

    if (vm.newRecord) {
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.securityGroupModel );
    } else {
      miqService.sparkleOn();
      API.get("/api/security_groups/" + securityGroupFormId + "?attributes=name,ext_management_system.name,description,cloud_tenant.name,firewall_rules").then(function(data) {
        vm.securityGroupModel.name = data.name;
        vm.securityGroupModel.ems_name = data.ext_management_system.name;
        vm.securityGroupModel.description = data.description;
        vm.securityGroupModel.cloud_tenant_name = angular.isDefined(data.cloud_tenant) ? data.cloud_tenant.name : undefined;
        vm.securityGroupModel.firewall_rules = data.firewall_rules;
        vm.securityGroupModel.firewall_rules_delete = false;
        vm.afterGet = true;
        vm.modelCopy = angular.copy( vm.securityGroupModel );
      }).catch(miqService.handleFailure);
      miqService.sparkleOff();
    }
  };

  var getSecurityGroups = function() {
    API.get("/api/security_groups/?expand=resources&attributes=ems_ref,id,name").then(function(data) {
      vm.security_groups_list = data.resources;
    }).catch(miqService.handleFailure);
  };

  vm.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, vm.securityGroupModel, { complete: false });
  };

  vm.addFirewallRuleClicked = function() {
    var index = vm.securityGroupModel.firewall_rules.length;
    vm.securityGroupModel.firewall_rules[index] = {
      id: null,
      resource_id: securityGroupFormId,
      resource_type: "SecurityGroup",
      direction: "inbound",
      ems_ref: null,
      end_port: null,
      host_protocol: null,
      network_protocol: null,
      port: null,
      source_ip_range: null,
      source_security_group_id: null,
    };
  };

  vm.cancelClicked = function() {
    if (vm.newRecord) {
      var url = '/security_group/create/new' + '?button=cancel';
    } else {
      var url = '/security_group/update/' + securityGroupFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.deleteFirewallRuleClicked = function(index) {
    vm.securityGroupModel.firewall_rules[index].deleted = true;
    if (vm.securityGroupModel.firewall_rules[index].id != null) {
      vm.securityGroupModel.firewall_rules_delete = true;
    }
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
