export default class EditCloudFormController {
  constructor($http, miqService, $timeout) {
    this.$http = $http;
    this.miqService = miqService;
    this.$timeout = $timeout;
    console.log('test from component');
  }

  $onInit() {
    this.currentTab = 'default';
    this.prefix = 'default';
    this.crendetialsLabels = {
      azure: {
        userIdLabel: __('Client ID'),
        passwordLabel: __('Client Key'),
        verifyLabel: __('Confirm Client Key'),
        changeStoredPassword: __('Change stored client key'),
        cancelPasswordChange: __('Cancel client key change'),
      },
      ec2: {
        userIdLabel: __('Access Key ID'),
        passwordLabel: __('Secret Access Key'),
        verifyLabel: __('Confirm Secret Access Key'),
        changeStoredPassword: __('Change stored secret access key'),
        cancelPasswordChange: __('Cancel secret access key change'),
      },
    };
    this.sharedFormModel = {
      name: null,
      emstype: null,
      provider_region: null,
      project: null,
      azure_tenant_id: null,
      subscription: null,
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
    };

    this.activeTab = 'default';
    this.tabs = [{
      name: 'default',
      id: 'default_tab',
      title: __('Default'),
    }, {
      name: 'ampq',
      id: 'ampq_tab',
      title: __('Events'),
    }];

    this.authenticationRequired = true;
    this.actionUrl = this.newRecord ? this.createCloudUrl : this.updateUrl;

    if (this.newRecord) {
      this.miqService.sparkleOn();
      this.formId = 'new';
      this.$http.get(this.cloudFieldsUrl + this.formId)
        .then(this.getNewEmsFormDataComplete)
        .catch(this.miqService.handleFailure);
    } else {
      this.miqService.sparkleOn();
      this.formId = this.emsCommonFormId;
      this.$http.get(this.formFieldsUrl + this.formId)
        .then(this.getEmsFormIdDataComplete)
        .catch(this.miqService.handleFailure);
    }
  }

  getNewEmsFormDataComplete = (response) => {
    const data = { ...response.data };
    this.sharedFormModel.name = '';
    this.sharedFormModel.emstype = '';
    this.sharedFormModel.provider_region = '';
    this.sharedFormModel.project = '';
    this.sharedFormModel.azure_tenant_id = '';
    this.sharedFormModel.subscription = '';
    this.sharedFormModel.api_version = 'v2';
    this.sharedFormModel.keystone_v3_domain_id = '';
    this.sharedFormModel.zone = data.zone;
    this.sharedFormModel.tenant_mapping_enabled = data.tenant_mapping_enabled;
    this.sharedFormModel.emstype_vm = data.emstype_vm;
    this.sharedFormModel.default_security_protocol = data.default_security_protocol;
    this.sharedFormModel.default_hostname = data.default_hostname;
    this.sharedFormModel.openstack_infra_providers_exist = data.openstack_infra_providers_exist;
    this.sharedFormModel.default_api_port = '';
    this.miqService.sparkleOff();
    this.modelCopy = angular.copy(this.sharedFormModel);
    this.afterGet = true;
  }

  getEmsFormIdDataComplete = (response) => {
    const data = { ...response.data };

    this.sharedFormModel.name = data.name;
    this.sharedFormModel.emstype = data.emstype;
    this.sharedFormModel.provider_region = data.provider_region;
    this.sharedFormModel.project = data.project;
    this.sharedFormModel.azure_tenant_id = data.azure_tenant_id;
    this.sharedFormModel.subscription = data.subscription;
    this.sharedFormModel.api_version = data.api_version;
    this.sharedFormModel.keystone_v3_domain_id = data.keystone_v3_domain_id;
    this.sharedFormModel.provider_id = data.provider_id !== undefined ? data.provider_id.toString() : '';
    this.sharedFormModel.zone = data.zone;
    this.sharedFormModel.tenant_mapping_enabled = data.tenant_mapping_enabled;
    this.sharedFormModel.host_default_vnc_port_start = data.host_default_vnc_port_start;
    this.sharedFormModel.host_default_vnc_port_end = data.host_default_vnc_port_end;
    this.sharedFormModel.openstack_infra_providers_exist = data.openstack_infra_providers_exist;
    this.sharedFormModel.default_security_protocol = data.default_security_protocol;
    this.sharedFormModel.emstype_vm = data.emstype_vm;
    this.sharedFormModel.default_hostname = data.default_hostname;
    this.sharedFormModel.default_api_port = data.default_api_port !== undefined && data.default_api_port !== '' ? data.default_api_port.toString() : this.getDefaultApiPort(this.sharedFormModel.emstype);
    this.sharedFormModel.event_stream_selection = data.event_stream_selection;
    this.miqService.sparkleOff();
    this.modelCopy = angular.copy(this.sharedFormModel);
    this.afterGet = true;
  }

  validateClicked = () => {
    this.sharedFormModel.button = 'validate';
    const options = {
      done: (response) => {
        if (response === Object(response)) {
          const data = JSON.parse(response.responseText);
          this.$timeout(() => {
            this.authenticationRequired = data.level === 'error';
            this.miqService.miqFlash(data.level, data.message, data.options);
            this.miqService.sparkleOff();
          });
        } else {
          this.miqService.miqFlash('error', __('Something went wrong, please check the logs for more information.'));
          this.miqService.sparkleOff();
        }
      },
    };
    this.miqService.miqAjaxButton(this.actionUrl, this.sharedFormModel, options);
  }

  postValidationModelRegistry = (prefix) => {
    if (this.postValidationModel === undefined) {
      this.postValidationModel = {
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
      let defaultPassword = this.sharedFormModel.default_password;
      if (!this.newRecord) {
        defaultPassword = this.sharedFormModel.default_password === '' ? '' : this.miqService.storedPasswordPlaceholder;
      }
      this.postValidationModel.default = {
        default_userid: this.sharedFormModel.default_userid,
        default_password: defaultPassword,
        azure_tenant_id: this.sharedFormModel.azure_tenant_id,
        subscription: this.sharedFormModel.subscription,
        provider_region: this.sharedFormModel.provider_region,
      };
    }
  }

  setActiveTab = (tab) => {
    this.activeTab = tab;
  }

  static getDefaultApiPort(emstype) {
    if (emstype === 'openstack' || emstype === 'openstack_infra') {
      return '5000';
    }
    return '';
  }

  emsTypeChange = (type) => {
    if (type === 'openstack') {
      this.sharedFormModel.event_stream_selection = 'ceilometer';
    }
    if (type === 'vmware_cloud') {
      this.sharedFormModel.event_stream_selection = 'none';
    }
  }

  cancelClicked = () => {
    this.miqService.sparkleOn();
    let url = this.newRecord ? this.createCloudUrl : 'blaa';
    url += '?button=cancel';
    this.miqService.miqAjaxButton(url);
  }

  addClicked = () => {
    const url = `${this.createCloudUrl}?button=add`;
    this.miqService.miqAjaxButton(url, this.sharedFormModel);
  }
}

EditCloudFormController.$inject = ['$http', 'miqService', '$timeout'];

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
    ampqSecurityProtocols: '<',
  },
  templateUrl: '/static/ems-common/edit-cloud-form.html.haml',
  controller: EditCloudFormController,
});
