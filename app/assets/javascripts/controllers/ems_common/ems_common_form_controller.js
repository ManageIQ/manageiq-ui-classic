ManageIQ.angular.app.controller('emsCommonFormController', ['$http', '$scope', '$attrs', 'emsCommonFormId', 'miqService', '$timeout', 'API', function($http, $scope, $attrs, emsCommonFormId, miqService, $timeout, API) {
  var init = function() {
    $scope.emsCommonModel = {
      name: '',
      emstype: '',
      openstack_infra_providers_exist: false,
      provider_id: '',
      zone: '',
      tenant_mapping_enabled: false,
      hostname: '',
      default_hostname: '',
      amqp_hostname: '',
      amqp_fallback_hostname1: '',
      amqp_fallback_hostname2: '',
      provider_options: {},
      metrics_hostname: '',
      metrics_selection: '',
      metrics_api_port: '',
      metrics_security_protocol: '',
      metrics_tls_ca_certs: '',
      project: '',
      default_api_port: '',
      amqp_api_port: '',
      api_version: '',
      default_security_protocol: '',
      default_tls_verify: true,
      default_tls_ca_certs: '',
      realm: '',
      security_protocol: '',
      amqp_security_protocol: '',
      provider_region: '',
      default_userid: '',
      default_password: '',
      amqp_userid: '',
      amqp_password: '',
      console_userid: '',
      console_password: '',
      smartstate_docker_userid: '',
      smartstate_docker_password: '',
      metrics_userid: '',
      metrics_password: '',
      metrics_database_name: '',
      ssh_keypair_userid: '',
      ssh_keypair_password: '',
      service_account: '',
      default_service_account: '',
      emstype_vm: false,
      ems_common: true,
      azure_tenant_id: '',
      keystone_v3_domain_id: '',
      subscription: '',
      host_default_vnc_port_start: '',
      host_default_vnc_port_end: '',
      event_stream_selection: '',
      bearer_token_exists: false,
      ems_controller: '',
      default_auth_status: '',
      amqp_auth_status: '',
      service_account_auth_status: '',
      metrics_auth_status: '',
      ssh_keypair_auth_status: '',
      vmware_cloud_api_version: '',
      prometheus_alerts_hostname: '',
      prometheus_alerts_api_port: '',
      prometheus_alerts_tls_ca_certs: '',
      prometheus_alerts_auth_status: '',
      prometheus_alerts_security_protocol: '',
      smartstate_docker_auth_status: true,
      alerts_selection: '',
      console_auth_status: true,
      virtualization_selection: '',
      kubevirt_hostname: '',
      kubevirt_api_port: '',
      kubevirt_auth_status: '',
      kubevirt_security_protocol: '',
      kubevirt_tls_ca_certs: '',
      kubevirt_password: '',
      kubevirt_password_exists: false,
      default_url: '',
    };

    $scope.emsOptionsModel = {
      provider_options: {},
      provider_options_original_values: {},
    };

    $scope.formId = emsCommonFormId;
    $scope.afterGet = false;
    $scope.modelCopy = angular.copy( $scope.emsCommonModel );
    $scope.formFieldsUrl = $attrs.formFieldsUrl;
    $scope.createUrl = $attrs.createUrl;
    $scope.updateUrl = $attrs.updateUrl;
    $scope.checkAuthentication = true;

    $scope.model = 'emsCommonModel';

    ManageIQ.angular.scope = $scope;

    if (emsCommonFormId === 'new') {
      $scope.newRecord                  = true;

      miqService.sparkleOn();
      $http.get($scope.formFieldsUrl + emsCommonFormId)
        .then(getNewEmsFormDataComplete)
        .catch(miqService.handleFailure);
    } else {
      $scope.newRecord = false;
      miqService.sparkleOn();

      $http.get($scope.formFieldsUrl + emsCommonFormId)
        .then(getEmsFormIdDataComplete)
        .catch(miqService.handleFailure);
    }
    $scope.actionUrl = $scope.newRecord ? $scope.createUrl : $scope.updateUrl;
    $scope.currentTab = 'default';

    function getEmsFormIdDataComplete(response) {
      var data = response.data;

      $scope.emsCommonModel.name                            = data.name;
      $scope.emsCommonModel.emstype                         = data.emstype;
      $scope.emsCommonModel.zone                            = data.zone;
      $scope.emsCommonModel.zone_hidden                     = data.zone_hidden;
      $scope.emsCommonModel.tenant_mapping_enabled          = data.tenant_mapping_enabled;
      $scope.emsCommonModel.hostname                        = data.hostname;
      $scope.emsCommonModel.default_hostname                = data.default_hostname;
      $scope.emsCommonModel.amqp_hostname                   = data.amqp_hostname;
      $scope.emsCommonModel.amqp_fallback_hostname1         = data.amqp_fallback_hostname1;
      $scope.emsCommonModel.amqp_fallback_hostname2         = data.amqp_fallback_hostname2;
      $scope.emsCommonModel.metrics_selection               = data.metrics_selection;
      $scope.emsCommonModel.metrics_hostname                = data.metrics_hostname;
      $scope.emsCommonModel.project                         = data.project;

      $scope.emsCommonModel.openstack_infra_providers_exist = data.openstack_infra_providers_exist;

      $scope.emsCommonModel.provider_id                     = data.provider_id !== undefined ? data.provider_id.toString() : '';

      $scope.emsCommonModel.default_api_port                = data.default_api_port !== undefined && data.default_api_port !== '' ? data.default_api_port.toString() : $scope.getDefaultApiPort($scope.emsCommonModel.emstype);
      $scope.emsCommonModel.metrics_port                    = data.metrics_port !== undefined && data.metrics_port !== '' ? data.metrics_port.toString() : '443';
      $scope.emsCommonModel.amqp_api_port                   = data.amqp_api_port !== undefined && data.amqp_api_port !== '' ? data.amqp_api_port.toString() : '5672';
      $scope.emsCommonModel.metrics_database_name           = data.metrics_database_name !== undefined && data.metrics_database_name !== '' ? data.metrics_database_name : data.metrics_default_database_name;
      $scope.emsCommonModel.api_version                     = data.api_version;
      $scope.emsCommonModel.default_security_protocol       = data.default_security_protocol;
      $scope.emsCommonModel.realm                           = data.realm;
      $scope.emsCommonModel.security_protocol               = data.security_protocol;
      $scope.emsCommonModel.default_tls_verify              = data.default_tls_verify;
      $scope.emsCommonModel.default_tls_ca_certs            = data.default_tls_ca_certs;
      $scope.emsCommonModel.amqp_security_protocol          = data.amqp_security_protocol !== '' ? data.amqp_security_protocol : 'non-ssl';
      $scope.emsCommonModel.metrics_security_protocol       = data.metrics_security_protocol;
      $scope.emsCommonModel.metrics_tls_ca_certs            = data.metrics_tls_ca_certs;
      $scope.emsCommonModel.provider_region                 = data.provider_region;
      $scope.emsCommonModel.default_userid                  = data.default_userid;
      $scope.emsCommonModel.amqp_userid                     = data.amqp_userid;
      $scope.emsCommonModel.console_userid                  = data.console_userid;
      $scope.emsCommonModel.metrics_userid                  = data.metrics_userid;
      $scope.emsCommonModel.smartstate_docker_userid        = data.smartstate_docker_userid;
      $scope.emsCommonModel.vmware_cloud_api_version        = data.api_version;

      $scope.emsCommonModel.ssh_keypair_userid              = data.ssh_keypair_userid;

      $scope.emsCommonModel.service_account                 = data.service_account;
      $scope.emsCommonModel.default_service_account         = data.service_account;
      $scope.emsCommonModel.azure_tenant_id                 = data.azure_tenant_id;
      $scope.emsCommonModel.keystone_v3_domain_id           = data.keystone_v3_domain_id;
      $scope.emsCommonModel.subscription                    = data.subscription;

      $scope.emsCommonModel.host_default_vnc_port_start     = data.host_default_vnc_port_start;
      $scope.emsCommonModel.host_default_vnc_port_end       = data.host_default_vnc_port_end;

      $scope.emsCommonModel.event_stream_selection          = data.event_stream_selection;

      $scope.emsCommonModel.bearer_token_exists             = data.bearer_token_exists;

      $scope.emsCommonModel.ems_controller                  = data.ems_controller;
      $scope.emsCommonModel.default_auth_status             = data.default_auth_status;
      $scope.emsCommonModel.amqp_auth_status                = data.amqp_auth_status;
      $scope.emsCommonModel.service_account_auth_status     = data.service_account_auth_status;
      $scope.emsCommonModel.metrics_auth_status             = data.metrics_auth_status;
      $scope.emsCommonModel.ssh_keypair_auth_status         = data.ssh_keypair_auth_status;
      $scope.emsCommonModel.metrics_api_port                = data.metrics_api_port !== undefined && data.metrics_api_port !== '' ? data.metrics_api_port.toString() : '';
      $scope.emsCommonModel.alerts_selection                = data.alerts_selection;
      $scope.emsCommonModel.prometheus_alerts_hostname      = data.prometheus_alerts_hostname;
      $scope.emsCommonModel.prometheus_alerts_api_port      = data.prometheus_alerts_api_port !== undefined && data.prometheus_alerts_api_port !== '' ? data.prometheus_alerts_api_port.toString() : '443';
      $scope.emsCommonModel.prometheus_alerts_auth_status   = data.prometheus_alerts_auth_status;
      $scope.emsCommonModel.prometheus_alerts_security_protocol = data.prometheus_alerts_security_protocol;
      $scope.emsCommonModel.prometheus_alerts_tls_ca_certs  = data.prometheus_alerts_tls_ca_certs;

      $scope.emsCommonModel.virtualization_selection        = data.virtualization_selection;
      $scope.emsCommonModel.kubevirt_hostname               = data.kubevirt_hostname;
      $scope.emsCommonModel.kubevirt_api_port               = data.kubevirt_api_port !== undefined && data.kubevirt_api_port !== '' ? data.kubevirt_api_port.toString() : '443';
      $scope.emsCommonModel.kubevirt_auth_status            = data.kubevirt_auth_status;
      $scope.emsCommonModel.kubevirt_security_protocol      = data.kubevirt_security_protocol;
      $scope.emsCommonModel.kubevirt_tls_ca_certs           = data.kubevirt_tls_ca_certs;
      $scope.emsCommonModel.kubevirt_password_exists        = data.kubevirt_password_exists;

      $scope.emsCommonModel.default_url                     = data.default_url;

      $scope.currentTab                                     = data.non_default_current_tab || 'default';

      if ($scope.emsCommonModel.default_userid !== '') {
        $scope.emsCommonModel.default_password = miqService.storedPasswordPlaceholder;
      }
      if ($scope.emsCommonModel.amqp_userid !== '') {
        $scope.emsCommonModel.amqp_password = miqService.storedPasswordPlaceholder;
      }
      if ($scope.emsCommonModel.console_userid !== '') {
        $scope.emsCommonModel.console_password = miqService.storedPasswordPlaceholder;
      }
      if ($scope.emsCommonModel.metrics_userid !== '') {
        $scope.emsCommonModel.metrics_password = miqService.storedPasswordPlaceholder;
      }
      if ($scope.emsCommonModel.smartstate_docker_userid !== '') {
        $scope.emsCommonModel.smartstate_docker_password = miqService.storedPasswordPlaceholder;
      }
      if ($scope.emsCommonModel.ssh_keypair_userid !== '') {
        $scope.emsCommonModel.ssh_keypair_password = miqService.storedPasswordPlaceholder;
      }
      if ($scope.emsCommonModel.bearer_token_exists) {
        $scope.emsCommonModel.default_userid = '_';
        $scope.emsCommonModel.default_password = miqService.storedPasswordPlaceholder;
      }
      if ($scope.emsCommonModel.kubevirt_password_exists) {
        $scope.emsCommonModel.kubevirt_password = miqService.storedPasswordPlaceholder;
      }

      $scope.afterGet  = true;
      $scope.modelCopy = angular.copy( $scope.emsCommonModel );

      $scope.populatePostValidationModel();

      miqService.sparkleOff();

      $scope.hideDisabledTabs();

      $scope.emsOptionsModel.provider_options_original_values = data.provider_options;
      $scope.updateProviderOptionsDescription();
    }

    function getNewEmsFormDataComplete(response) {
      var data = response.data;

      $scope.emsCommonModel.emstype                         = '';
      $scope.emsCommonModel.zone                            = data.zone;
      $scope.emsCommonModel.tenant_mapping_enabled          = data.tenant_mapping_enabled;
      $scope.emsCommonModel.emstype_vm                      = data.emstype_vm;
      $scope.emsCommonModel.openstack_infra_providers_exist = data.openstack_infra_providers_exist;
      $scope.emsCommonModel.default_api_port                = '';
      $scope.emsCommonModel.amqp_api_port                   = '5672';
      $scope.emsCommonModel.alerts_selection                = data.alerts_selection;
      $scope.emsCommonModel.prometheus_alerts_api_port      = '443';
      $scope.emsCommonModel.prometheus_alerts_auth_status   = data.prometheus_alerts_auth_status;
      $scope.emsCommonModel.prometheus_alerts_security_protocol = data.prometheus_alerts_security_protocol;
      $scope.emsCommonModel.prometheus_alerts_tls_ca_certs  = data.prometheus_alerts_tls_ca_certs;
      if (["openstack", "openstack_infra"].includes($scope.emsCommonModel.ems_controller)) {
        $scope.emsCommonModel.api_version                   = 'v2';
      }
      $scope.emsCommonModel.ems_controller                  = data.ems_controller;
      $scope.emsCommonModel.ems_controller === 'ems_container' ? $scope.emsCommonModel.default_api_port = '8443' : $scope.emsCommonModel.default_api_port = '';
      $scope.emsCommonModel.metrics_api_port                = '443';
      $scope.emsCommonModel.metrics_selection               = data.metrics_selection;
      $scope.emsCommonModel.default_security_protocol       = data.default_security_protocol;
      $scope.emsCommonModel.metrics_security_protocol       = data.metrics_security_protocol;
      $scope.emsCommonModel.default_tls_ca_certs            = data.default_tls_ca_certs;
      $scope.emsCommonModel.metrics_tls_ca_certs            = data.metrics_tls_ca_certs;
      $scope.emsCommonModel.default_auth_status             = data.default_auth_status;
      $scope.emsCommonModel.amqp_auth_status                = data.amqp_auth_status;
      $scope.emsCommonModel.service_account_auth_status     = data.service_account_auth_status;
      $scope.emsCommonModel.ssh_keypair_auth_status         = true;
      $scope.emsCommonModel.metrics_auth_status             = data.metrics_auth_status;
      $scope.emsCommonModel.vmware_cloud_api_version        = '9.0';
      $scope.emsCommonModel.virtualization_selection        = data.virtualization_selection;
      $scope.emsCommonModel.kubevirt_api_port               = $scope.emsCommonModel.default_api_port;
      $scope.emsCommonModel.kubevirt_auth_status            = data.kubevirt_auth_status;
      $scope.emsCommonModel.kubevirt_security_protocol      = $scope.emsCommonModel.default_security_protocol;
      $scope.emsCommonModel.kubevirt_tls_ca_certs           = $scope.emsCommonModel.default_tls_ca_certs;
      $scope.emsCommonModel.kubevirt_password               = data.kubevirt_password;

      miqService.sparkleOff();
      $scope.hideDisabledTabs();
      $scope.afterGet  = true;
      $scope.modelCopy = angular.copy( $scope.emsCommonModel );
    }
  };

  $scope.useridPrivileged = function() {
    // disabled outside the default tab
    if ($scope.currentTab !== 'default') {
      return false;
    }

    // disabled for container providers
    if ($scope.emsCommonModel.ems_controller == 'ems_container') {
      return false;
    }

    // disabled for specific types
    var blacklist = [
      'azure_stack',
      'gce',
      'kubevirt',
    ];
    return ! blacklist.includes($scope.emsCommonModel.emstype);
  }

  $scope.hideDisabledTabs = function() {
    if ($scope.emsCommonModel.alerts_selection === 'disabled') {
      angular.element('#alerts_tab').hide();
    }

    if ($scope.emsCommonModel.metrics_selection === 'disabled') {
      angular.element('#metrics_tab').hide();
    }

    if ($scope.emsCommonModel.virtualization_selection === 'disabled') {
      angular.element('#kubevirt_tab').hide();
    }
  };

  $scope.changeAuthTab = function(id) {
    $scope.currentTab = id;
  };

  $scope.changeAuthTabToVirtualization = function(id) {
    $scope.emsCommonModel.kubevirt_hostname = $scope.emsCommonModel.default_hostname;
    $scope.emsCommonModel.kubevirt_api_port = $scope.emsCommonModel.default_api_port;
    $scope.emsCommonModel.kubevirt_security_protocol = $scope.emsCommonModel.default_security_protocol;
    $scope.emsCommonModel.kubevirt_tls_verify = $scope.emsCommonModel.default_tls_verify;
    $scope.emsCommonModel.kubevirt_tls_ca_certs = $scope.emsCommonModel.default_tls_ca_certs;
    $scope.changeAuthTab(id);
  };

  $scope.canValidateBasicInfo = function() {
    return $scope.isBasicInfoValid();
  };

  $scope.isBasicInfoValid = function() {
    if (($scope.currentTab === 'default' && $scope.emsCommonModel.emstype !== 'azure') &&
      ($scope.emsCommonModel.emstype === 'ec2' ||
       ['kubevirt', 'nuage_network', 'openstack', 'openstack_infra', 'rhevm', 'scvmm', 'vmwarews', 'vmware_cloud'].includes($scope.emsCommonModel.emstype) &&
       $scope.emsCommonModel.default_hostname) &&
      ($scope.emsCommonModel.default_userid !== '' && $scope.angularForm.default_userid !== undefined && $scope.angularForm.default_userid.$valid &&
       $scope.emsCommonModel.default_password !== '' && $scope.angularForm.default_password !== undefined && $scope.angularForm.default_password.$valid)) {
      return true;
    } else if (($scope.currentTab === 'amqp') &&
      ($scope.emsCommonModel.amqp_hostname) &&
      ($scope.emsCommonModel.amqp_userid !== '' && $scope.angularForm.amqp_userid !== undefined && $scope.angularForm.amqp_userid.$valid &&
       $scope.emsCommonModel.amqp_password !== '' && $scope.angularForm.amqp_password !== undefined && $scope.angularForm.amqp_password.$valid)) {
      return true;
    } else if (($scope.currentTab === 'console') &&
      ($scope.emsCommonModel.console_userid !== '' && $scope.angularForm.console_userid !== undefined &&
       $scope.emsCommonModel.console_password !== '' && $scope.angularForm.console_password !== undefined)) {
      return true;
    } else if (($scope.currentTab === 'smartstate_docker') &&
      ($scope.emsCommonModel.smartstate_docker_userid !== '' && $scope.angularForm.smartstate_docker_userid !== undefined &&
       $scope.emsCommonModel.smartstate_docker_password !== '' && $scope.angularForm.smartstate_docker_password !== undefined)) {
      return true;
    } else if (($scope.currentTab === 'default' && $scope.emsCommonModel.emstype === 'azure') &&
      ($scope.emsCommonModel.azure_tenant_id !== '' && $scope.angularForm.azure_tenant_id.$valid) &&
      ($scope.emsCommonModel.default_userid !== '' && $scope.angularForm.default_userid.$valid &&
       $scope.emsCommonModel.default_password !== '' && $scope.angularForm.default_password.$valid) &&
       ($scope.newRecord && $scope.angularForm.provider_region.$valid || !$scope.newRecord)) {
      return true;
    } else if (($scope.currentTab === 'ssh_keypair' &&
      ($scope.emsCommonModel.emstype === 'openstack' || $scope.emsCommonModel.emstype === 'openstack_infra')) &&
      ($scope.emsCommonModel.ssh_keypair_userid !== '' && $scope.angularForm.ssh_keypair_userid.$valid &&
      $scope.emsCommonModel.ssh_keypair_password !== '' && $scope.angularForm.ssh_keypair_password.$valid)) {
      return true;
    } else if (($scope.currentTab === 'metrics' && $scope.emsCommonModel.emstype === 'rhevm') &&
      $scope.emsCommonModel.metrics_database_name &&
      ($scope.emsCommonModel.metrics_hostname !== '' && $scope.angularForm.metrics_hostname.$valid) &&
      ($scope.emsCommonModel.metrics_userid !== '' && $scope.angularForm.metrics_userid.$valid &&
      $scope.emsCommonModel.metrics_password !== '' && $scope.angularForm.metrics_password.$valid)) {
      return true;
    } else if ($scope.currentTab === 'default' &&
        ['ems_container', 'ems_middleware', 'ems_physical_infra'].indexOf($scope.emsCommonModel.ems_controller) >= 0 &&
      ($scope.emsCommonModel.emstype) &&
      ($scope.emsCommonModel.default_hostname !== '' && $scope.emsCommonModel.default_api_port) &&
      ($scope.emsCommonModel.default_password !== '' && $scope.angularForm.default_password.$valid)) {
      return true;
    } else if (($scope.emsCommonModel.ems_controller === 'ems_container') &&
      ($scope.emsCommonModel.emstype) &&
      ($scope.emsCommonModel.default_password !== '' && $scope.angularForm.default_password.$valid) &&
      (($scope.currentTab === 'metrics' &&
        $scope.emsCommonModel.metrics_hostname !== '' &&
        $scope.emsCommonModel.metrics_api_port) ||
       ($scope.currentTab === 'alerts' &&
        $scope.emsCommonModel.prometheus_alerts_hostname !== '' &&
        $scope.emsCommonModel.prometheus_alerts_api_port !== '') ||
       ($scope.currentTab === 'kubevirt' &&
        $scope.emsCommonModel.kubevirt_hostname !== '' &&
        $scope.emsCommonModel.kubevirt_password !== '' &&
        $scope.emsCommonModel.kubevirt_api_port !== ''))) {
      return true;
    } else if ($scope.emsCommonModel.emstype === 'gce' && $scope.emsCommonModel.project !== '' &&
      ($scope.currentTab === 'default' ||
      ($scope.currentTab === 'service_account' && $scope.emsCommonModel.service_account !== ''))) {
      return true;
    } else if ($scope.emsCommonModel.emstype === 'kubevirt') {
      return true;
    } else if ($scope.emsCommonModel.emstype === 'azure_stack') {
      return !!$scope.emsCommonModel.azure_tenant_id &&
        !!$scope.emsCommonModel.subscription &&
        !!$scope.emsCommonModel.api_version &&
        !!$scope.emsCommonModel.default_hostname &&
        !!$scope.emsCommonModel.default_security_protocol &&
        !!$scope.emsCommonModel.default_api_port &&
        !!$scope.emsCommonModel.default_userid &&
        !!$scope.emsCommonModel.default_password
    }
    return false;
  };

  $scope.isDetectionEnabled = function() {
    return ($scope.emsCommonModel.ems_controller === 'ems_container') &&
      ($scope.emsCommonModel.emstype === 'openshift') &&
      ($scope.emsCommonModel.default_hostname && $scope.emsCommonModel.default_api_port) &&
      ($scope.emsCommonModel.default_password !== '' && $scope.angularForm.default_password.$valid);
  };

  var emsCommonEditButtonClicked = function(buttonName, _serializeFields, $event) {
    miqService.sparkleOn();
    var url = $scope.updateUrl + '?button=' + buttonName;
    miqService.restAjaxButton(url, $event.target);
  };

  var emsCommonAddButtonClicked = function(buttonName, _serializeFields, $event) {
    miqService.sparkleOn();
    var url = $scope.createUrl + '?button=' + buttonName;
    miqService.restAjaxButton(url, $event.target);
  };

  $scope.cancelClicked = function($event) {
    angular.element('#button_name').val('cancel');
    if ($scope.newRecord) {
      emsCommonAddButtonClicked('cancel', false, $event);
    } else {
      emsCommonEditButtonClicked('cancel', false, $event);
    }

    $scope.angularForm.$setPristine(true);
  };

  $scope.resetClicked = function() {
    $scope.$broadcast('resetClicked');
    $scope.emsCommonModel = angular.copy( $scope.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));

    if ($scope.emsCommonModel.event_stream_selection === 'ceilometer') {
      $scope.$broadcast('clearErrorOnTab', {tab: 'amqp'});
    }

    var authStatus = $scope.currentTab + '_auth_status';
    if ($scope.emsCommonModel[authStatus] === true) {
      $scope.postValidationModelRegistry($scope.currentTab);
    }
  };

  $scope.detectClicked = function($event) {
    miqService.sparkleOn();
    miqService.detectWithRest($event, $scope.actionUrl)
      .then(function success(data) {
        $scope.updateHostname(data.hostname);
        miqService.miqFlash(data.level, data.message);
        miqSparkleOff();
      });
  };

  $scope.saveClicked = function($event, formSubmit) {
    if (formSubmit) {
      angular.element('#button_name').val('save');
      emsCommonEditButtonClicked('save', true, $event);
    } else {
      $event.preventDefault();
    }
  };

  $scope.addClicked = function($event, formSubmit) {
    if (formSubmit) {
      angular.element('#button_name').val('add');
      emsCommonAddButtonClicked('add', true, $event);
    } else {
      $event.preventDefault();
    }
  };

  $scope.tabSelectionChanged = function(tabSelector, selection) {
    if (selection === 'disabled') {
      $scope.changeAuthTab('default');
      angular.element('.nav-tabs a[href="#default"]').tab('show');
      angular.element(tabSelector).hide();
    } else {
      angular.element(tabSelector).show();
    }
  };

  $scope.metricSelectionChanged = function() {
    $scope.tabSelectionChanged('#metrics_tab', $scope.emsCommonModel.metrics_selection);
  };

  $scope.alertsSelectionChanged = function() {
    $scope.tabSelectionChanged('#alerts_tab', $scope.emsCommonModel.alerts_selection);
  };

  $scope.virtualizationSelectionChanged = function() {
    $scope.tabSelectionChanged('#kubevirt_tab', $scope.emsCommonModel.virtualization_selection);
  };

  $scope.providerTypeChanged = function() {
    $scope.updateProviderOptionsDescription();
    if ($scope.emsCommonModel.ems_controller === 'ems_container') {
      if ($scope.emsCommonModel.emstype === 'kubernetes') {
        $scope.emsCommonModel.default_api_port = '6443';
      } else {
        $scope.emsCommonModel.default_api_port = '8443';
      }
      return;
    }
    if ($scope.emsCommonModel.emstype === 'gce') {
      $scope.currentTab = 'service_account';
      return;
    }
    $scope.emsCommonModel.default_api_port = '';
    $scope.emsCommonModel.provider_region = '';
    $scope.emsCommonModel.default_security_protocol = '';
    $scope.emsCommonModel.default_tls_verify = true;
    $scope.emsCommonModel.default_tls_ca_certs = '';
    $scope.note = '';
    if ($scope.emsCommonModel.emstype === 'openstack' || $scope.emsCommonModel.emstype === 'openstack_infra') {
      $scope.emsCommonModel.default_api_port = $scope.getDefaultApiPort($scope.emsCommonModel.emstype);
      $scope.emsCommonModel.event_stream_selection = 'ceilometer';
      $scope.emsCommonModel.amqp_security_protocol = 'non-ssl';
      if ($scope.emsCommonModel.emstype === 'openstack') {
        $scope.emsCommonModel.tenant_mapping_enabled = false;
      }
    } else if ($scope.emsCommonModel.emstype === 'nuage_network') {
      $scope.emsCommonModel.default_api_port = $scope.getDefaultApiPort($scope.emsCommonModel.emstype);
      $scope.emsCommonModel.event_stream_selection = 'none';
      $scope.emsCommonModel.amqp_security_protocol = 'non-ssl';
    } else if ($scope.emsCommonModel.emstype === 'scvmm') {
      $scope.emsCommonModel.default_security_protocol = 'ssl';
    } else if ($scope.emsCommonModel.emstype === 'rhevm') {
      $scope.emsCommonModel.metrics_api_port = '5432';
      $scope.emsCommonModel.default_api_port = $scope.getDefaultApiPort($scope.emsCommonModel.emstype);
      $scope.emsCommonModel.metrics_database_name = 'ovirt_engine_history';
    } else if ($scope.emsCommonModel.emstype === 'vmware_cloud') {
      $scope.emsCommonModel.default_api_port = '443';
      $scope.emsCommonModel.event_stream_selection = 'none';
      $scope.emsCommonModel.amqp_security_protocol = 'non-ssl';
    } else if ($scope.emsCommonModel.emstype === 'lenovo_ph_infra') {
      $scope.emsCommonModel.default_api_port = '443';
    }
  };

  $scope.openstackSecurityProtocolChanged = function() {
    if ($scope.emsCommonModel.emstype === 'openstack' || $scope.emsCommonModel.emstype === 'openstack_infra') {
      if ($scope.emsCommonModel.default_security_protocol === 'non-ssl') {
        $scope.emsCommonModel.default_api_port = $scope.getDefaultApiPort($scope.emsCommonModel.emstype);
      } else {
        $scope.emsCommonModel.default_api_port = '13000';
      }
    }
  };

  $scope.hawkularSecurityProtocolChanged = function() {
    var defaultNonSSLPort = '8080';
    var defaultSSLPort = '8443';
    var defaultPorts = [defaultNonSSLPort, defaultSSLPort];
    if (typeof $scope.emsCommonModel.default_api_port === 'undefined' ||
        $scope.emsCommonModel.default_api_port === '' ||
        defaultPorts.indexOf($scope.emsCommonModel.default_api_port) != -1) {
      if ($scope.emsCommonModel.default_security_protocol === 'non-ssl') {
        $scope.emsCommonModel.default_api_port = defaultNonSSLPort;
      } else {
        $scope.emsCommonModel.default_api_port = defaultSSLPort;
      }
    }
  };

  $scope.getDefaultApiPort = function(emstype) {
    if ( emstype === 'openstack' || emstype === 'openstack_infra') {
      return '5000';
    }

    return '';
  };

  $scope.populatePostValidationModel = function() {
    if ($scope.emsCommonModel.default_auth_status === true) {
      $scope.postValidationModelRegistry('default');
    }
    if ($scope.emsCommonModel.amqp_auth_status === true) {
      $scope.postValidationModelRegistry('amqp');
    }
    if ($scope.emsCommonModel.console_auth_status === true) {
      $scope.postValidationModelRegistry('console');
    }
    if ($scope.emsCommonModel.service_account_auth_status === true) {
      $scope.postValidationModelRegistry('service_account');
    }
    if ($scope.emsCommonModel.metrics_auth_status === true) {
      $scope.postValidationModelRegistry('metrics');
    }
    if ($scope.emsCommonModel.ssh_keypair_auth_status === true) {
      $scope.postValidationModelRegistry('ssh_keypair');
    }
    if ($scope.emsCommonModel.prometheus_alerts_auth_status === true) {
      $scope.postValidationModelRegistry('prometheus_alerts');
    }
    if ($scope.emsCommonModel.kubevirt_auth_status === true) {
      $scope.postValidationModelRegistry('kubevirt');
    }
  };

  $scope.postValidationModelRegistry = function(prefix) {
    if ($scope.postValidationModel === undefined) {
      $scope.postValidationModel = {
        default: {},
        amqp: {},
        console: {},
        metrics: {},
        ssh_keypair: {},
        prometheus_alerts: {},
        kubevirt: {},
      };
    }
    if (prefix === 'default') {
      if ($scope.newRecord) {
        var default_password = $scope.emsCommonModel.default_password;
      } else {
        var default_password = $scope.emsCommonModel.default_password === '' ? '' : miqService.storedPasswordPlaceholder;
      }
      $scope.postValidationModel.default = {
        default_hostname:          $scope.emsCommonModel.default_hostname,
        default_api_port:          $scope.emsCommonModel.default_api_port,
        default_security_protocol: $scope.emsCommonModel.default_security_protocol,
        default_tls_verify:        $scope.emsCommonModel.default_tls_verify,
        default_tls_ca_certs:      $scope.emsCommonModel.default_tls_ca_certs,
        default_userid:            $scope.emsCommonModel.default_userid,
        default_password:          default_password,
        default_url:               $scope.emsCommonModel.default_url,
        default_service_account:   $scope.emsCommonModel.default_service_account,
        realm:                     $scope.emsCommonModel.realm,
        azure_tenant_id:           $scope.emsCommonModel.azure_tenant_id,
        subscription:              $scope.emsCommonModel.subscription,
        provider_region:           $scope.emsCommonModel.provider_region,
      };
    } else if (prefix === 'amqp') {
      if ($scope.newRecord) {
        var amqp_password = $scope.emsCommonModel.amqp_password;
      } else {
        var amqp_password = $scope.emsCommonModel.amqp_password === '' ? '' : miqService.storedPasswordPlaceholder;
      }
      $scope.postValidationModel.amqp = {
        amqp_hostname:             $scope.emsCommonModel.amqp_hostname,
        amqp_fallback_hostname1:             $scope.emsCommonModel.amqp_fallback_hostname1,
        amqp_fallback_hostname2:             $scope.emsCommonModel.amqp_fallback_hostname2,
        amqp_api_port:             $scope.emsCommonModel.amqp_api_port,
        amqp_security_protocol:    $scope.emsCommonModel.amqp_security_protocol,
        amqp_userid:               $scope.emsCommonModel.amqp_userid,
        amqp_password:             amqp_password,
      };
    } else if (prefix === 'console') {
      if ($scope.newRecord) {
        var console_password = $scope.emsCommonModel.console_password;
      } else {
        var console_password = $scope.emsCommonModel.console_password === '' ? '' : miqService.storedPasswordPlaceholder;
      }
      $scope.postValidationModel.console = {
        console_userid:           $scope.emsCommonModel.console_userid,
        console_password:         console_password,
      };
    } else if (prefix === 'metrics') {
      var metricsValidationModel = {
        metrics_hostname: $scope.emsCommonModel.metrics_hostname,
        metrics_api_port: $scope.emsCommonModel.metrics_api_port,
      };
      if ($scope.emsCommonModel.metrics_selection === 'hawkular' || $scope.emsCommonModel.metrics_selection === 'prometheus') {
        metricsValidationModel.metrics_security_protocol = $scope.emsCommonModel.metrics_security_protocol;
        metricsValidationModel.metrics_tls_ca_certs = $scope.emsCommonModel.metrics_tls_ca_certs;
      } else {
        if ($scope.newRecord) {
          var metrics_password = $scope.emsCommonModel.metrics_password;
        } else {
          var metrics_password = $scope.emsCommonModel.metrics_password === '' ? '' : miqService.storedPasswordPlaceholder;
        }
        metricsValidationModel.metrics_userid = $scope.emsCommonModel.metrics_userid;
        metricsValidationModel.metrics_password = metrics_password;
      }
      $scope.postValidationModel.metrics = metricsValidationModel;
    } else if (prefix === 'ssh_keypair') {
      if ($scope.newRecord) {
        var ssh_keypair_password = $scope.emsCommonModel.ssh_keypair_password;
      } else {
        var ssh_keypair_password = $scope.emsCommonModel.ssh_keypair_password === '' ? '' : miqService.storedPasswordPlaceholder;
      }
      $scope.postValidationModel.ssh_keypair = {
        ssh_keypair_userid:        $scope.emsCommonModel.ssh_keypair_userid,
        ssh_keypair_password:      ssh_keypair_password,
      };
    } else if (prefix === 'service_account') {
      $scope.postValidationModel.service_account = {
        service_account:           $scope.emsCommonModel.service_account,
      };
    } else if (prefix === 'prometheus_alerts') {
      $scope.postValidationModel.prometheus_alerts = {};
      ['prometheus_alerts_hostname', 'prometheus_alerts_api_port', 'prometheus_alerts_security_protocol', 'prometheus_alerts_tls_ca_certs']
        .forEach( function(resource) {
          $scope.postValidationModel.prometheus_alerts[resource] = $scope.emsCommonModel[resource];
        });
    } else if (prefix === 'kubevirt') {
      $scope.postValidationModel.kubevirt = {};
      ['kubevirt_hostname', 'kubevirt_api_port', 'kubevirt_security_protocol', 'kubevirt_tls_ca_certs', 'kubevirt_password']
        .forEach( function(resource) {
          $scope.postValidationModel.kubevirt[resource] = $scope.emsCommonModel[resource];
        });
    }
  };

  $scope.validateClicked = function($event, _authType, formSubmit) {
    miqService.validateWithREST($event, $scope.currentTab, $scope.actionUrl, formSubmit)
      .then(function success(data) {
        // check if data object is a JSON, otherwise (recieved JS or HTML) output a warning to the user.
        if (data === Object(data)) {
          $timeout(function() {
            $scope.$apply(function() {
              if (data.level === 'error') {
                $scope.updateAuthStatus(false);
              } else {
                $scope.updateAuthStatus(true);
              }
              miqService.miqFlash(data.level, data.message, data.options);
              miqSparkleOff();
            });
          });
        } else {
          miqService.miqFlash('error', __('Something went wrong, please check the logs for more information.'));
          miqSparkleOff();
        }
      });
  };

  $scope.updateAuthStatus = function(updatedValue) {
    $scope.angularForm[$scope.currentTab + '_auth_status'].$setViewValue(updatedValue);
  };

  $scope.updateHostname = function(value) {
    if ($scope.currentTab === 'alerts') {
      $scope.emsCommonModel.prometheus_alerts_hostname = value;
    } else {
      $scope.emsCommonModel.metrics_hostname = value;
    }
  };

  $scope.radioSelectionChanged = function() {
    if ($scope.emsCommonModel.event_stream_selection === 'ceilometer' ||
        $scope.emsCommonModel.event_stream_selection === 'none') {
      if ($scope.postValidationModel !== undefined) {
        $scope.emsCommonModel.amqp_hostname = $scope.postValidationModel.amqp.amqp_hostname;
        $scope.emsCommonModel.amqp_fallback_hostname1 = $scope.postValidationModel.amqp.amqp_fallback_hostname1;
        $scope.emsCommonModel.amqp_fallback_hostname2 = $scope.postValidationModel.amqp.amqp_fallback_hostname2;
        $scope.emsCommonModel.amqp_api_port = $scope.postValidationModel.amqp.amqp_api_port;
        $scope.emsCommonModel.amqp_security_protocol = $scope.postValidationModel.amqp.amqp_security_protocol;
        $scope.emsCommonModel.amqp_userid = $scope.postValidationModel.amqp.amqp_userid;
        $scope.emsCommonModel.amqp_password = $scope.postValidationModel.amqp.amqp_password;
      }
      $scope.$broadcast('clearErrorOnTab', {tab: 'amqp'});
    }
  };

  $scope.updateProviderOptionsDescription = function() {
    API.options('/api/providers').then(function(response) {
      $scope.setProviderOptionsDescription(response.data);
    });
  };

  $scope.setProviderOptionsDescription = function(apiResponse) {
    if (!apiResponse.hasOwnProperty('provider_settings')) {
      return;
    }
    if (!apiResponse.provider_settings.hasOwnProperty($scope.emsCommonModel.emstype)) {
      return;
    }
    $scope.emsOptionsModel.provider_options = apiResponse.provider_settings[$scope.emsCommonModel.emstype];
    if ($scope.emsOptionsModel.provider_options.hasOwnProperty('advanced_settings')) {
      var advanced_settings = $scope.emsOptionsModel.provider_options.advanced_settings.settings;
      $scope.emsCommonModel.provider_options.advanced_settings = {};
      for (var section in advanced_settings) {
        if (advanced_settings.hasOwnProperty(section)) {
          $scope.emsCommonModel.provider_options.advanced_settings[section] = {};
          $scope.updateProviderOptionsOldValues(advanced_settings[section],
            $scope.emsCommonModel.provider_options.advanced_settings[section]);
        }
      }
    }
    if ($scope.emsOptionsModel.provider_options.hasOwnProperty('proxy_settings')) {
      $scope.emsCommonModel.provider_options.proxy_settings = {};
      $scope.updateProviderOptionsOldValues($scope.emsOptionsModel.provider_options.proxy_settings,
        $scope.emsCommonModel.provider_options.proxy_settings);
    }
  };

  // Sets the values and names of the options in sourceSection and destSection from
  // $scope.emsOptionsModel.provider_options_original_values if they exist there.
  $scope.updateProviderOptionsOldValues = function(sourceSection, destSection) {
    var section_name = _.snakeCase(sourceSection.label);
    sourceSection.section_name = section_name;
    for (var option in sourceSection.settings) {
      if (sourceSection.settings.hasOwnProperty(option)) {
        if ($scope.emsOptionsModel.provider_options_original_values.hasOwnProperty(section_name) &&
          $scope.emsOptionsModel.provider_options_original_values[section_name].hasOwnProperty(option)) {
          sourceSection.settings[option].value = $scope.emsOptionsModel.provider_options_original_values[section_name][option];
        } else {
          sourceSection.settings[option].value = '';
        }
        sourceSection.settings[option].name = option;
        destSection[option] = sourceSection.settings[option];
      }
    }
  };

  init();
}]);
