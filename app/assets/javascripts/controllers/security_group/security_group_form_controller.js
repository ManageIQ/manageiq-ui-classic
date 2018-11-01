ManageIQ.angular.app.controller('securityGroupFormController', ['securityGroupFormId', 'miqService', 'API', '$q', function(securityGroupFormId, miqService, API, $q) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;
    vm.securityGroupModel = {
      name: '',
      description: '',
      firewall_rules: [],
    };
    vm.ems = [];

    vm.hostProtocols = ['', 'TCP', 'UDP', 'ICMP'];
    vm.networkProtocols = ['IPV4', 'IPV6'];
    vm.directions = ['inbound', 'outbound'];

    vm.formId = securityGroupFormId;
    vm.model = 'securityGroupModel';
    vm.newRecord = securityGroupFormId === 'new';
    vm.saveable = miqService.saveable;

    if (vm.newRecord) {
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.securityGroupModel );

      miqService.networkProviders()
        .then(function(providers) {
          vm.ems = providers;
        });
    } else {
      miqService.sparkleOn();

      $q.all([getSecurityGroup(securityGroupFormId), getSecurityGroups()])
        .then(function() {
          vm.afterGet = true;
          vm.modelCopy = _.cloneDeep(vm.securityGroupModel);
          miqService.sparkleOff();
        })
        .catch(miqService.handleFailure);
    }
  };

  function getSecurityGroup(id) {
    return API.get('/api/security_groups/' + id + '?attributes=name,ext_management_system.name,description,cloud_tenant.name,firewall_rules')
      .then(function(data) {
        Object.assign(vm.securityGroupModel, data);
        vm.securityGroupModel.firewall_rules_delete = false;
      });
  }

  function getSecurityGroups() {
    return API.get('/api/security_groups/?expand=resources&attributes=ems_ref,id,name')
      .then(function(data) {
        vm.security_groups_list = data.resources;
      });
  }

  vm.addClicked = function() {
    var url = 'create/new?button=add';
    miqService.miqAjaxButton(url, vm.securityGroupModel, { complete: false });
  };

  vm.addFirewallRuleClicked = function() {
    var index = vm.securityGroupModel.firewall_rules.length;
    vm.securityGroupModel.firewall_rules[index] = {
      id: null,
      resource_id: securityGroupFormId,
      resource_type: 'SecurityGroup',
      direction: 'inbound',
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
    var url;
    if (vm.newRecord) {
      url = '/security_group/create/new?button=cancel';
    } else {
      url = '/security_group/update/' + securityGroupFormId + '?button=cancel';
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
    vm.securityGroupModel = _.cloneDeep(vm.modelCopy);
    for (var index = 0, len = vm.securityGroupModel.firewall_rules.length; index < len; index++) {
      if (vm.securityGroupModel.firewall_rules[index] === undefined || vm.securityGroupModel.firewall_rules[index].deleted === true) {
        vm.securityGroupModel.firewall_rules.splice(index, 1);
      }
    }
    angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.filterNetworkManagerChanged = miqService.getProviderTenants(function(data) {
    vm.available_tenants = data.resources;
  });

  init();
}]);
