ManageIQ.angular.app.component('emsEditCloudForm', {
  bindings: {
    newRecord: '<',
    cloudFieldsUrl: '@',
    createCloudUrl: '@?',
    emsCommonFormId: '@?',
    emsTypeOptions: '<',
    providerRegions: '<',
    apiVersionOptions: '<',
    nuageApiVersionOptions: '<',
    emsInfraProviderIdOptions: '<',
    emsZoneOptions: '<',
    providerRegionsOptions: '<',
    openstackSecurityProtocols: '<',
    ampqSecurityProtocols: '<'
  },
  templateUrl: '/static/ems-common/edit-cloud-form.html.haml',
  controllerAs: 'vm',
  controller: ['$http', 'miqService', '$timeout', function($http, miqService, $timeout) {
    var vm = this;
    vm.$onInit = function() {
      vm.currentTab = 'default';
      vm.prefix = 'default';
      vm.crendetialsLabels = {
        azure: {
          userIdLabel: __("Client ID"),
          passwordLabel: __("Client Key"),
          verifyLabel: __("Confirm Client Key"),
          changeStoredPassword: __("Change stored client key"),
          cancelPasswordChange: __("Cancel client key change"),
        },
        ec2: {
          userIdLabel: __("Access Key ID"),
          passwordLabel: __("Secret Access Key"),
          verifyLabel: __("Confirm Secret Access Key"),
          changeStoredPassword: __("Change stored secret access key"),
          cancelPasswordChange: __("Cancel secret access key change"),
        }
      }
      vm.sharedFormModel = {
        name: null,
        emstype: null,
        provider_region: null,
        project: null,
        azure_tenant_id: null, // TODO: replace in postValidationModel replace with shared form model
        subscription: null, // TODO: replace in postValidationModel replace with shared form model
        api_version: null,
        zone: null,
        ems_type: false,
        host_default_vnc_port_start: '',
        host_default_vnc_port_end: '',
        openstack_infra_providers_exist: false,
        default_userid: '',
        default_password: '',
        cred_type: 'default',
        button: 'validate',
        emstype_vm: null,
        default_security_protocol: null,
        default_hostname: null,
        event_stream_selection: 'ceilometer',
      }

      vm.activeTab = 'default';
      vm.tabs = [{
        name: 'default',
        id: 'default_tab',
        title: __("Default"),
      }, {
        name: 'ampq',
        id: 'ampq_tab',
        title: __("Events")
      }]

      vm.authenticationRequired = true;
      vm.actionUrl = vm.newRecord ? vm.createCloudUrl : vm.updateUrl;

      if(vm.newRecord) {
        miqService.sparkleOn();
        vm.formId = 'new';
        $http.get(vm.cloudFieldsUrl + vm.formId)
          .then(vm.getNewEmsFormDataComplete)
          .catch(miqService.handleFailure);
      } else {
        miqService.sparkleOn();
        vm.formId = vm.emsCommonFormId;
        $http.get(vm.formFieldsUrl + vm.formId)
          .then(vm.getEmsFormIdDataComplete)
          .catch(miqService.handleFailure);
      }
    }

    vm.getNewEmsFormDataComplete = function(response) {
      var data = response.data;

      vm.sharedFormModel.name = '';
      vm.sharedFormModel.emstype = '';
      vm.sharedFormModel.provider_region = '';
      vm.sharedFormModel.project = '';
      vm.sharedFormModel.azure_tenant_id = '';
      vm.sharedFormModel.subscription = '';
      vm.sharedFormModel.api_version = 'v2';
      vm.sharedFormModel.keystone_v3_domain_id = '';
      vm.sharedFormModel.zone = data.zone;
      vm.sharedFormModel.tenant_mapping_enabled = data.tenant_mapping_enabled;
      vm.sharedFormModel.emstype_vm = data.emstype_vm;
      vm.sharedFormModel.default_security_protocol = data.default_security_protocol;
      vm.sharedFormModel.default_hostname = data.default_hostname;
      vm.sharedFormModel.openstack_infra_providers_exist = data.openstack_infra_providers_exist;
      miqService.sparkleOff();
      vm.modelCopy = angular.copy( vm.sharedFormModel );
      vm.afterGet  = true;
      vm.sharedFormModel.default_api_port = '';
    }

    vm.getEmsFormIdDataComplete = function(response) {
      var data = response.data;

      vm.sharedFormModel.name = data.name;
      vm.sharedFormModel.emstype = data.emstype;
      vm.sharedFormModel.provider_region = data.provider_region;
      vm.sharedFormModel.project = data.project;
      vm.sharedFormModel.azure_tenant_id = data.azure_tenant_id;
      vm.sharedFormModel.subscription = data.subscription;
      vm.sharedFormModel.api_version = data.api_version;
      vm.sharedFormModel.keystone_v3_domain_id = data.keystone_v3_domain_id;
      vm.sharedFormModel.provider_id = data.provider_id !== undefined ? data.provider_id.toString() : "";
      vm.sharedFormModel.zone = zone;
      vm.sharedFormModel.tenant_mapping_enabled = data.tenant_mapping_enabled;
      vm.sharedFormModel.host_default_vnc_port_start = data.host_default_vnc_port_start;
      vm.sharedFormModel.host_default_vnc_port_end = data.host_default_vnc_port_end;
      vm.sharedFormModel.openstack_infra_providers_exist = data.openstack_infra_providers_exist;
      vm.sharedFormModel.default_security_protocol = data.default_security_protocol;
      vm.sharedFormModel.emstype_vm = data.emstype_vm;
      vm.sharedFormModel.default_hostname = data.default_hostname;
      vm.sharedFormModel.default_api_port = data.default_api_port !== undefined && data.default_api_port !== '' ? data.default_api_port.toString() : vm.getDefaultApiPort(vm.sharedFormModel.emstype);
      vm.sharedFormModel.event_stream_selection = data.event_stream_selection;
      miqService.sparkleOff()
      vm.modelCopy = angular.copy( vm.sharedFormModel );
      vm.afterGet  = true;
    }

    vm.validateClicked = function() {
      vm.sharedFormModel.button = 'validate';
      var options = {
        done: function(response) {
          if (response === Object(response)) {
            data = JSON.parse(response.responseText);
            $timeout(function() {
              vm.authenticationRequired = data.level === "error";
              miqService.miqFlash(data.level, data.message, data.options);
              miqService.sparkleOff();
            });
          } else {
            miqService.miqFlash("error", __('Something went wrong, please check the logs for more information.'));
            miqService.sparkleOff();
          }
        }
      }
      miqAjaxButton(vm.actionUrl, vm.sharedFormModel, options);
    }

    vm.postValidationModelRegistry = function(prefix) {
      if (vm.postValidationModel === undefined) {
        vm.postValidationModel = {
          default: {},
          amqp: {},
          console: {},
          metrics: {},
          ssh_keypair: {},
          prometheus_alerts: {},
          kubevirt: {},
        }
      }
      if (prefix === "default") {
        var default_password = vm.sharedFormModel.default_password;
        if (! vm.newRecord) {
          default_password = vm.sharedFormModel.default_password === "" ? "" : miqService.storedPasswordPlaceholder;
        }
        vm.postValidationModel.default = {
          default_userid: vm.sharedFormModel.default_userid,
          default_password: default_password,
          azure_tenant_id: vm.sharedFormModel.azure_tenant_id,
          subscription: vm.sharedFormModel.subscription,
          provider_region: vm.sharedFormModel.provider_region
        };
      }
    }

    vm.setActiveTab = function(tab) {
      vm.activeTab = tab;
    }

    vm.getDefaultApiPort = function(emstype) {
      if( emstype=='openstack' || emstype === 'openstack_infra') {
        return '5000';
      }
      return ''
    };

    vm.emsTypeChange = function(type) {
      if(type === 'openstack') {
        vm.sharedFormModel.event_stream_selection = 'ceilometer'
      }
      if(type === 'vmware_cloud') {
        vm.sharedFormModel.event_stream_selection = 'none'
      }
    }

    vm.cancelClicked = function(event) {
      miqService.sparkleOn()
      var url = vm.newRecord ? this.createCloudUrl : 'blaa';
      url = url + '?button=cancel';
      miqService.miqAjaxButton(url);
    }

    vm.addClicked = function(event, formSubmit) {
      var url = vm.createCloudUrl + '?button=add';
      miqService.miqAjaxButton(url, vm.sharedFormModel);
    }
  }]
});
