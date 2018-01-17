miqHttpInject(angular.module('miq.containers.providersModule', ['ui.bootstrap', 'patternfly', 'miq.dialogs', 'miq.wizard', 'ManageIQ', 'miq.api'])).controller('containers.deployProviderController',
  ['$rootScope', '$scope', 'miqService', 'API', '$timeout',
  function($rootScope, $scope, miqService, API, $timeout) {
    'use strict';
    var vm = this;
    vm.showDeploymentWizard = false;
    ManageIQ.angular.scope = vm;
    vm.data = {};
    vm.nodeData = {
      allNodes: [],
      filteredNodes: [],
      providerVMs: [],
      newVMs: [],
      userDefinedVMs: []
    };

    vm.deployProviderReady = false;
    vm.deployComplete = false;
    vm.deployInProgress = false;
    vm.deploySuccess = false;
    vm.deployFailed = false;
    vm.deploymentDetailsGeneralComplete = false;
    vm.nextButtonTitle = __("Next >");

    var initializeDeploymentWizard = vm.initializeDeploymentWizard = function () {
      vm.data = {
        providerName: '',
        providerType: 'openshiftEnterprise',
        provisionOn: 'existingVms',
        masterCount: 0,
        nodeCount: 0,
        infraNodeCount: 0,
        cdnConfigType: 'satellite',
        authentication: {
          mode: 'all'
        }
      };

      vm.data.existingProviders = vm.deploymentData.providers;
      vm.data.newVmProviders = vm.deploymentData.provision;
      vm.originAvailable = vm.deploymentData.deployment_types.includes("origin");
      vm.deployProviderReady = true;
    };

    var create_auth_object = vm.create_auth_object = function () {
      var auth = {};
      switch (vm.data.authentication.mode) {
        case 'all':
          auth.type = "AuthenticationAllowAll";
          break;
        case 'htPassword':
          auth.type = 'AuthenticationHtpasswd';
          auth.htpassd_users = vm.data.authentication.htPassword.users;
          break;
        case 'ldap':
          Object.assign(auth, vm.data.authentication.ldap);
          auth.type = 'AuthenticationLdap';
          auth.bind_dn = vm.data.authentication.ldap.bindDN;
          auth.password = vm.data.authentication.ldap.bindPassword;
          auth.certificate_authority = vm.data.authentication.ldap.ca;
          delete auth.bindDN;
          delete auth.bindPassword;
          delete auth.ca;
          break;
        case 'requestHeader':
          auth.type = 'AuthenticationRequestHeader';
          auth.request_header_challenge_url = vm.data.authentication.requestHeader.challengeUrl;
          auth.request_header_login_url = vm.data.authentication.requestHeader.loginUrl;
          auth.certificate_authority = vm.data.authentication.requestHeader.clientCA;
          auth.request_header_headers = vm.data.authentication.requestHeader.headers;
          break;
        case 'openId':
          auth.type = 'AuthenticationOpenId';
          auth.userid = vm.data.authentication.openId.clientId;
          auth.password = vm.data.authentication.openId.clientSecret;
          auth.open_id_sub_claim = vm.data.authentication.openId.subClaim;
          auth.open_id_authorization_endpoint = vm.data.authentication.openId.authEndpoint;
          auth.open_id_token_endpoint = vm.data.authentication.openId.tokenEndpoint;
          break;
        case 'google':
          auth.type = 'AuthenticationGoogle';
          auth.userid = vm.data.authentication.google.clientId;
          auth.password = vm.data.authentication.google.clientSecret;
          auth.google_hosted_domain = vm.data.authentication.google.hostedDomain;
          break;
        case 'github':
          auth.type = 'AuthenticationGithub';
          auth.userid = vm.data.authentication.github.clientId;
          auth.password = vm.data.authentication.github.clientSecret;
          break;
      }
      return auth;
    };

    var create_nodes_object = vm.create_nodes_object = function() {
      var nodes = [];
      vm.nodeData.allNodes.forEach(function(item) {
        var name = "";
        if (vm.data.provisionOn == 'existingVms') {
          var id = item.id;
          name = item.name;
        }
        else if (vm.data.provisionOn == 'noProvider') {
          name = item.vmName;
          var publicName = item.publicName;
        }
        nodes.push({
          name: name,
          id: id,
          public_name: publicName,
          roles: {
            master: item.master,
            node: item.node,
            storage: item.storage,
            master_lb: item.loadBalancer,
            dns: item.dns,
            etcd: item.etcd,
            infrastructure: item.infrastructure
          }
        });
      });
      nodes = nodes.filter(function (node) {
        return node.roles.master || node.roles.node || node.roles.storage
      });
      return nodes;
    };

    var create_deployment_resource = function() {
      var method_types = {
        existingVms: "existing_managed",
        newVms: "provision",
        noProvider: "unmanaged"
      };

      var resource = {
        provider_name: vm.data.providerName,
        provider_type: vm.data.providerType,
        method_type: method_types[vm.data.provisionOn],
        rhsm_authentication: {
          userid: vm.data.rhnUsername,
          password: vm.data.rhnPassword,
          rhsm_sku: vm.data.rhnSKU,
          rhsm_server: vm.data.rhnSatelliteUrl
        },
        ssh_authentication: {
          userid: vm.data.deploymentUsername,
          auth_key: vm.data.deploymentKey
        },
        nodes: create_nodes_object(),
        identity_authentication: create_auth_object()
      };

      if (vm.data.provisionOn == 'existingVms') {
        resource.underline_provider_id = vm.data.existingProviderId;
      } else if (vm.data.provisionOn == 'newVms') {
        resource.underline_provider_id = vm.data.newVmProviderId;
        resource.masters_creation_template_id = vm.data.masterCreationTemplateId;
        resource.nodes_creation_template_id = vm.data.nodeCreationTemplateId;
        resource.master_base_name = vm.data.createMasterBaseName;
        resource.node_base_name = vm.data.createNodesBaseName;
      }
      return resource;
    };

    vm.ready = false;

    vm.data = {};
    vm.deployComplete = false;
    vm.deployInProgress = false;

    var startDeploy = vm.startDeploy = function () {
      vm.deployInProgress = true;
      vm.deployComplete = false;
      vm.deploySuccess = false;
      vm.deployFailed = false;

      var url = '/api/container_deployments';
      var resource = create_deployment_resource();
      API.post(url, {"action" : "create", "resource" : resource}).then(function (response) {
        'use strict';
        vm.deployInProgress = false;
        vm.deployComplete = true;
        vm.deployFailed = response.error !== undefined;
        if (response.error) {
          if (response.error.message) {
            vm.deployFailureMessage = response.error.message;
          }
          else {
            vm.deployFailureMessage = __("An unknown error has occurred.");
          }
        }
      });
    };

    vm.nextCallback = function(step) {
      if (step.stepId === 'review-summary') {
        startDeploy();
      }
      return true;
    };
    vm.backCallback = function(step) {
      return true;
    };

    $scope.$on("wizard:stepChanged", function(e, parameters) {
      if (parameters.step.stepId == 'review-summary') {
        vm.nextButtonTitle = __("Deploy");
      } else if (parameters.step.stepId == 'review-progress') {
        vm.nextButtonTitle = __("Close");
      } else {
        vm.nextButtonTitle = __("Next >");
      }
    });

    vm.showDeploymentWizard = false;
    vm.showListener = function() {
      if (!vm.showDeploymentWizard) {
        var url = '/api/container_deployments';
        API.options(url).then(function (response) {
          'use strict';
          vm.deploymentData = response.data;
          initializeDeploymentWizard();
          vm.ready = true;
        });
        vm.showDeploymentWizard = true;
      }
    };

    vm.cancelDeploymentWizard = function () {
      if (!vm.deployInProgress) {
        vm.showDeploymentWizard = false;
      }
    };

    vm.cancelWizard = function () {
      vm.showDeploymentWizard = false;
      return true;
    };

    vm.finishedWizard = function () {
      $rootScope.$emit('deployProvider.finished');
      vm.showDeploymentWizard = false;
      return true;
    };

    ManageIQ.angular.rxSubject.subscribe(function(event) {
      if (event.controller !== 'containers.deployProviderController') {
        return;
      }

      $timeout(function() {
        if (event.name === 'showListener') {
          vm.showListener();
        }
      });
    });
  }
]);
