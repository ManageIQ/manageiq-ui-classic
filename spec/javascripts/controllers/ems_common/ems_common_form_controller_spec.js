describe('emsCommonFormController', function() {
  var $scope, $controller, $httpBackend, miqService, compile, API;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, _miqService_, _$compile_, _API_) {
    miqService = _miqService_;
    compile = _$compile_;
    API = _API_;
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'restAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    spyOn(API, 'options').and.callFake(function(url){ return Promise.resolve({}); });
    spyOn(miqService, 'validateWithREST').and.callFake(function(url){ return Promise.resolve({}); });
    $scope = $rootScope.$new();

    var emsCommonFormResponse = {
      name: '',
      emstype: '',
      zone: 'default',
      emstype_vm: false,
      openstack_infra_providers_exist: false,
      api_port: '',
      api_version: 'v2'
    };
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('/ems_cloud/ems_cloud_form_fields/new').respond(emsCommonFormResponse);
    $controller = _$controller_('emsCommonFormController',
      {$scope: $scope,
        $attrs: {'formFieldsUrl': '/ems_cloud/ems_cloud_form_fields/',
          'createUrl': '/ems_cloud',
          'updateUrl': '/ems_cloud/12345'},
        emsCommonFormId: 'new',
        miqService: miqService,
        API: API
      });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('when the emsCommonFormId is new', function() {
    beforeEach(inject(function() {
      $httpBackend.flush();
    }));

    it('sets actionUrl to createUrl', function () {
      expect($scope.actionUrl).toEqual($scope.createUrl);
    });

    it('sets the name to blank', function () {
      expect($scope.emsCommonModel.name).toEqual('');
    });

    it('sets the type to blank', function () {
      expect($scope.emsCommonModel.emstype).toEqual('');
    });

    it('sets the zone to default', function() {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the emstype_vm to false', function() {
      expect($scope.emsCommonModel.emstype_vm).toEqual(false);
    });

    it('sets the openstack_infra_providers_exist to false', function() {
      expect($scope.emsCommonModel.openstack_infra_providers_exist).toEqual(false);
    });

    it('sets the default_api_port to blank', function() {
      expect($scope.emsCommonModel.default_api_port).toEqual('');
    });

    it('sets the amqp_api_port to 5672', function() {
      expect($scope.emsCommonModel.amqp_api_port).toEqual('5672');
    });

    it('sets the api_version to blank', function() {
      expect($scope.emsCommonModel.api_version).toEqual('');
    });

    it('sets the current tab to default', function() {
      expect($scope.currentTab).toEqual('default');
    });
  });

  describe('when the emsCommonFormId is an Amazon Id', function() {
    var emsCommonFormResponse = {
      id: 12345,
      name: 'amz',
      emstype: 'ec2',
      zone: 'default',
      emstype_vm: false,
      provider_id: 111,
      openstack_infra_providers_exist: false,
      provider_region: "ap-southeast-2",
      default_userid: "default_user",
      default_url: "http://host.test/abc",
      assume_role: 'arn:123',
    };

    beforeEach(inject(function(_$controller_) {
      $httpBackend.whenGET('/ems_cloud/ems_cloud_form_fields/12345').respond(emsCommonFormResponse);

      $controller = _$controller_('emsCommonFormController',
        {$scope: $scope,
          $attrs: {'formFieldsUrl': '/ems_cloud/ems_cloud_form_fields/',
            'createUrl': '/ems_cloud',
            'updateUrl': '/ems_cloud/12345'},
          emsCommonFormId: 12345,
          miqService: miqService,
          API: API
        });
      $httpBackend.flush();
    }));

    it('sets actionUrl to updateUrl', function () {
      expect($scope.actionUrl).toEqual($scope.updateUrl);
    });

    it('sets the name to the Amazon EC2 Cloud Provider', function () {
      expect($scope.emsCommonModel.name).toEqual('amz');
    });

    it('sets the type to ec2', function () {
      expect($scope.emsCommonModel.emstype).toEqual('ec2');
    });

    it('sets the zone to default', function() {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the emstype_vm to false', function() {
      expect($scope.emsCommonModel.emstype_vm).toEqual(false);
    });

    it('sets the openstack_infra_providers_exist to false', function() {
      expect($scope.emsCommonModel.openstack_infra_providers_exist).toEqual(false);
    });

    it('sets the provider_region', function() {
      expect($scope.emsCommonModel.provider_region).toEqual("ap-southeast-2");
    });

    it('sets the default_userid', function() {
      expect($scope.emsCommonModel.default_userid).toEqual("default_user");
    });

    it('sets the default_password', function() {
      expect($scope.emsCommonModel.default_password).toEqual(miqService.storedPasswordPlaceholder);
    });

    it('sets the default_url', function() {
      expect($scope.emsCommonModel.default_url).toEqual("http://host.test/abc");
    });

    it('sets default_assume_role', function() {
      expect($scope.emsCommonModel.default_assume_role).toEqual("arn:123");
    });

    it('sets the current tab to default', function() {
      expect($scope.currentTab).toEqual('default');
    });

    it('initializes $scope.postValidationModel with credential objects for only those providers that support validation', function () {
      $scope.postValidationModelRegistry('default');
      expect($scope.postValidationModel).toEqual(jasmine.objectContaining({
        default: jasmine.objectContaining({provider_region: 'ap-southeast-2', default_assume_role: 'arn:123'}),
        console: jasmine.objectContaining({console_userid: undefined}),
        amqp: {},
        metrics: {},
        ssh_keypair: {},
        prometheus_alerts: {}}));
    });
  });

  describe('when the emsCommonFormId is an Openstack Id', function() {
    var emsCommonFormResponse = {
      id: 12345,
      name: 'myOpenstack',
      default_hostname: '10.22.33.44',
      amqp_hostname: '10.20.30.40',
      emstype: 'openstack',
      zone: 'default',
      emstype_vm: false,
      provider_id: 111,
      openstack_infra_providers_exist: false,
      default_userid: "default_user"
    };

    beforeEach(inject(function(_$controller_) {
      $httpBackend.whenGET('/ems_cloud/ems_cloud_form_fields/12345').respond(emsCommonFormResponse);

      $controller = _$controller_('emsCommonFormController',
        {$scope: $scope,
          $attrs: {'formFieldsUrl': '/ems_cloud/ems_cloud_form_fields/',
            'createUrl': '/ems_cloud',
            'updateUrl': '/ems_cloud/update/'},
          emsCommonFormId: 12345,
          miqService: miqService,
          API: API
        });
      $httpBackend.flush();
    }));

    it('sets the name to the Openstack Cloud Provider', function () {
      expect($scope.emsCommonModel.name).toEqual('myOpenstack');
    });

    it('sets the type to openstack', function () {
      expect($scope.emsCommonModel.emstype).toEqual('openstack');
    });

    it('sets the default hostname', function () {
      expect($scope.emsCommonModel.default_hostname).toEqual('10.22.33.44');
    });

    it('sets the amqp hostname', function () {
      expect($scope.emsCommonModel.amqp_hostname).toEqual('10.20.30.40');
    });

    it('sets the zone to default', function() {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the emstype_vm to false', function() {
      expect($scope.emsCommonModel.emstype_vm).toEqual(false);
    });

    it('sets the openstack_infra_providers_exist to false', function() {
      expect($scope.emsCommonModel.openstack_infra_providers_exist).toEqual(false);
    });

    it('sets the default_userid', function() {
      expect($scope.emsCommonModel.default_userid).toEqual("default_user");
    });

    it('sets the default_password', function() {
      expect($scope.emsCommonModel.default_password).toEqual(miqService.storedPasswordPlaceholder);
    });

    it('sets the current tab to default', function() {
      expect($scope.currentTab).toEqual('default');
    });
  });

  describe('when the emsCommonFormId is an Azure Id', function() {
    var emsCommonFormResponse = {
      id: 12345,
      name: 'Azure',
      azure_tenant_id: '10.22.33.44',
      subscription: '12345659-1234-41a4-a7ad-3ce6d1091234',
      emstype: 'azure',
      zone: 'default',
      emstype_vm: false,
      provider_id: 111,
      openstack_infra_providers_exist: false,
      default_userid: "default_user",
      default_url: "http://host.test/abc"
    };

    beforeEach(inject(function(_$controller_) {
      $httpBackend.whenGET('/ems_cloud/ems_cloud_form_fields/12345').respond(emsCommonFormResponse);

      $controller = _$controller_('emsCommonFormController',
        {$scope: $scope,
          $attrs: {'formFieldsUrl': '/ems_cloud/ems_cloud_form_fields/',
            'createUrl': '/ems_cloud',
            'updateUrl': '/ems_cloud/update/'},
          emsCommonFormId: 12345,
          miqService: miqService,
          API: API
        });
      $httpBackend.flush();
    }));

    it('sets the name to the Azure Cloud Provider', function () {
      expect($scope.emsCommonModel.name).toEqual('Azure');
    });

    it('sets the type to azure', function () {
      expect($scope.emsCommonModel.emstype).toEqual('azure');
    });

    it('sets the azure_tenant_id', function () {
      expect($scope.emsCommonModel.azure_tenant_id).toEqual('10.22.33.44');
    })

    it('sets the subscription', function () {
      expect($scope.emsCommonModel.subscription).toEqual('12345659-1234-41a4-a7ad-3ce6d1091234');
    });

    it('sets the zone to default', function() {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the emstype_vm to false', function() {
      expect($scope.emsCommonModel.emstype_vm).toEqual(false);
    });

    it('sets the openstack_infra_providers_exist to false', function() {
      expect($scope.emsCommonModel.openstack_infra_providers_exist).toEqual(false);
    });

    it('sets the default_userid', function() {
      expect($scope.emsCommonModel.default_userid).toEqual("default_user");
    });

    it('sets the default_password', function() {
      expect($scope.emsCommonModel.default_password).toEqual(miqService.storedPasswordPlaceholder);
    });

    it('sets the current tab to default', function() {
      expect($scope.currentTab).toEqual('default');
    });

    it('sets the default_url', function() {
      expect($scope.emsCommonModel.default_url).toEqual("http://host.test/abc");
    });
  });

  describe('#providerTypeChanged', function() {
    beforeEach(function() {
      $httpBackend.flush();
      $scope.emsCommonModel.emstype = 'gce';
      $scope.providerTypeChanged();
    });

    it('sets currentTab to service_account', function() {
      expect($scope.currentTab).toEqual('service_account');
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function() {
      $httpBackend.flush();
      $scope.angularForm = {
        $setPristine: function (value){},
        $setUntouched: function (value){}
      };
      $scope.resetClicked();
    });

    it('sets total spinner count to be 1', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(1);
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function() {
      $httpBackend.flush();
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      $scope.saveClicked($.Event, true);
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('sets total spinner count to be 2', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(2);
    });

    it('delegates to miqService.restAjaxButton', function() {
      expect(miqService.restAjaxButton).toHaveBeenCalledWith('/ems_cloud/12345?button=save', $.Event.target);
    });
  });

  describe('#addClicked', function() {
    beforeEach(function() {
      $httpBackend.flush();
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      $scope.addClicked($.Event, true);
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('delegates to miqService.restAjaxButton', function() {
      expect(miqService.restAjaxButton).toHaveBeenCalledWith('/ems_cloud?button=add', $.Event.target);
    });
  });

  describe('#cancelClicked', function() {
    beforeEach(function() {
      $httpBackend.flush();
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      $scope.cancelClicked($.Event);
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('delegates to miqService.restAjaxButton', function() {
      expect(miqService.restAjaxButton).toHaveBeenCalledWith('/ems_cloud?button=cancel', $.Event.target);
    });
  });

  describe('#validateClicked', function() {
    beforeEach(function() {
      $httpBackend.flush();
      $scope.currentTab = "console";
      $scope.actionUrl = "/xyz";
      $scope.validateClicked($.Event, "default", true);
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('delegates to miqService.validateClicked', function() {
      expect(miqService.validateWithREST).toHaveBeenCalledWith($.Event, "console", "/xyz", true);
    });
  });

  describe('Validates credential fields', function() {
    beforeEach(function() {
      $httpBackend.flush();
      var angularForm;
      var element = angular.element(
        '<form name="angularForm">' +
        '<input ng-model="emsCommonModel.hostname" name="hostname" required text />' +
        '<input ng-model="emsCommonModel.default_userid" name="default_userid" required text />' +
        '<input ng-model="emsCommonModel.default_password" name="default_password" required text />' +
        '</form>'
      );

      compile(element)($scope);
      $scope.$digest();
      angularForm = $scope.angularForm;

      $scope.angularForm.hostname.$setViewValue('abchost');
      $scope.angularForm.default_userid.$setViewValue('abcuser');
      $scope.angularForm.default_password.$setViewValue('abcpassword');
      $scope.currentTab = "default";
      $scope.emsCommonModel.emstype = "ec2";
    });

    it('returns true if all the Validation fields are filled in', function() {
      expect($scope.canValidateBasicInfo()).toBe(true);
    });
  });
});

describe('emsCommonFormController in the context of container provider', function() {
  var $scope, $controller, $httpBackend, miqService, compile, API;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function (_$httpBackend_, $rootScope, _$controller_, _miqService_, _$compile_, _API_) {
    miqService = _miqService_;
    API = _API_;
    compile = _$compile_;
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'restAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    spyOn(API, 'options').and.callFake(function(url){ return Promise.resolve({});});
    $scope = $rootScope.$new();

    var emsCommonFormResponse = {
      name: '',
      emstype: '',
      zone: 'default',
      emstype_vm: false,
      default_api_port: '',
      api_version: 'v2'
    };
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('/ems_container/ems_container_form_fields/new').respond(emsCommonFormResponse);
    $controller = _$controller_('emsCommonFormController',
      {
        $scope: $scope,
        $attrs: {
          'formFieldsUrl': '/ems_container/ems_container_form_fields/',
          'createUrl': '/ems_container',
          'updateUrl': '/ems_container/12345'
        },
        emsCommonFormId: 'new',
          miqService: miqService,
          API: API
      });
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('when the emsCommonFormId is new', function () {
    beforeEach(inject(function () {
      $httpBackend.flush();
    }));

    it('sets the name to blank', function () {
      expect($scope.emsCommonModel.name).toEqual('');
    });

    it('sets the type to kubernetes', function () {
      expect($scope.emsCommonModel.emstype).toEqual('');
    });

    it('sets the zone to default', function () {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the api_port to blank', function () {
      expect($scope.emsCommonModel.default_api_port).toEqual('');
    });

    it('sets the api_version to blank', function () {
      expect($scope.emsCommonModel.api_version).toEqual('');
    });

    it('sets the current tab to default', function() {
      expect($scope.currentTab).toEqual('default');
    });
  });

  describe('when the emsCommonFormId of existing provider', function () {
    var basic_options_example = {
      image_inspector_options: { http_proxy: 'example.com'},
      proxy_settings: { http_proxy: 'example2.com' }
    };

    var emsCommonFormResponse = {
      name: 'osp1',
      emstype: 'kubernetes',
      zone: 'default',
      emstype_vm: false,
      default_api_port: '',
      provider_options: basic_options_example,
      api_version: 'v2'
    };

    beforeEach(inject(function (_$controller_) {
      $httpBackend.whenGET('/ems_container/ems_container_form_fields/12345').respond(emsCommonFormResponse);

      $controller = _$controller_('emsCommonFormController',
        {
          $scope: $scope,
          $attrs: {
            'formFieldsUrl': '/ems_container/ems_container_form_fields/',
            'createUrl': '/ems_container',
            'updateUrl': '/ems_container/12345'
          },
          emsCommonFormId: 12345,
          miqService: miqService,
          API: API
        });
      $httpBackend.flush();
    }));

    it('sets the name to osp1', function () {
      expect($scope.emsCommonModel.name).toEqual(emsCommonFormResponse.name);
    });

    it('sets the type to kubernetes', function () {
      expect($scope.emsCommonModel.emstype).toEqual(emsCommonFormResponse.emstype);
    });

    it('sets the api_version to v2', function () {
      expect($scope.emsCommonModel.api_version).toEqual('v2');
    });

    it('sets the provider options to expected value', function () {
      expect($scope.emsOptionsModel.provider_options_original_values).toEqual(basic_options_example);
    });

    it('sets the current tab to default', function() {
      expect($scope.currentTab).toEqual('default');
    });
  });

  describe('#updateProviderOptionsOldValues', function () {
    it('sets sourceSection options in destSection', function () {
      $httpBackend.flush();
      $scope.emsOptionsModel.provider_options_original_values = {
        test_settings: {
          hello: "world",
        },
      };
      $scope.emsOptionsModel.provider_options = {
        test_settings:
        { label: "test_settings", settings: { hello: {}}  }
      };
      $scope.emsCommonModel.provider_options = {};
      $scope.emsCommonModel.provider_options.test_settings = {};
      $scope.updateProviderOptionsOldValues($scope.emsOptionsModel.provider_options.test_settings,
        $scope.emsCommonModel.provider_options.test_settings);
      expect($scope.emsCommonModel.provider_options.test_settings.hello.value).toEqual("world");
    });
  });

  describe('#setProviderOptionsDescription', function () {
    beforeEach(inject(function() {
      $httpBackend.flush();
      $scope.emsCommonModel.emstype = 'kubernetes';
      $scope.emsOptionsModel = {
        provider_options:                 {},
        provider_options_original_values: {},
      };
    }));

    it ('updates options descriptions', function () {
      $scope.emsCommonModel.emstype = 'kubernetes';
      response = {
        data: {
          provider_settings: {
            kubernetes: {
              advanced_settings: {
                settings: {
                  my_settings_section: {
                    label: "section_name_1",
                    settings: {
                      hello: {
                        label:     'hello',
                        help_text: 'help this text'
                      }
                    }
                  }
                }
              },
              proxy_settings: {
                settings: {
                  hello: {
                    label:     'hello',
                    help_text: 'help this text'
                  }
                }
              }
            }
          }
        }
      };
      $scope.setProviderOptionsDescription(response.data);
      expect($scope.emsOptionsModel
        .provider_options
        .advanced_settings
        .settings
        .my_settings_section
        .settings.hello.label).toEqual('hello');
    });
  });
});

describe('emsCommonFormController in the context of ems infra provider', function() {
  var $scope, $controller, $httpBackend, miqService, compile, API;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function (_$httpBackend_, $rootScope, _$controller_, _miqService_, _$compile_, _API_) {
    miqService = _miqService_;
    API = _API_;
    compile = _$compile_;
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'restAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    spyOn(API, 'options').and.callFake(function(url){ return Promise.resolve({});});
    $scope = $rootScope.$new();

    var emsCommonFormResponse = {
      name: '',
      emstype: '',
      zone: 'default',
      emstype_vm: false,
      openstack_infra_providers_exist: false,
      default_api_port: '',
      api_version: 'v2'
    };
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('/ems_infra/ems_infra_form_fields/new').respond(emsCommonFormResponse);
    $controller = _$controller_('emsCommonFormController',
      {
        $scope: $scope,
        $attrs: {
          'formFieldsUrl': '/ems_infra/ems_infra_form_fields/',
          'createUrl': '/ems_infra',
          'updateUrl': '/ems_infra/12345'
        },
        emsCommonFormId: 'new',
          miqService: miqService,
          API: API
      });
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('when the emsCommonFormId is new', function () {
    beforeEach(inject(function () {
      $httpBackend.flush();
    }));

    it('sets the name to blank', function () {
      expect($scope.emsCommonModel.name).toEqual('');
    });

    it('sets the type to blank', function () {
      expect($scope.emsCommonModel.emstype).toEqual('');
    });

    it('sets the zone to default', function () {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the api_port to blank', function () {
      expect($scope.emsCommonModel.default_api_port).toEqual('');
    });

    it('sets the api_version to blank', function () {
      expect($scope.emsCommonModel.api_version).toEqual('');
    });

    it('sets the current tab to default', function() {
      expect($scope.currentTab).toEqual('default');
    });
  });

  describe('when the emsCommonFormId is an SCVMM Id', function () {
    var emsCommonFormResponse = {
      id: 12345,
      name: 'msft',
      emstype: 'scvmm',
      zone: 'default',
      security_protocol: "ssl",
      default_userid: "default_user"
    };

    beforeEach(inject(function (_$controller_) {
      $httpBackend.whenGET('/ems_infra/ems_infra_form_fields/12345').respond(emsCommonFormResponse);

      $controller = _$controller_('emsCommonFormController',
        {
          $scope: $scope,
          $attrs: {
            'formFieldsUrl': '/ems_infra/ems_infra_form_fields/',
            'createUrl': '/ems_infra',
            'updateUrl': '/ems_infra/12345'
          },
          emsCommonFormId: 12345,
          miqService: miqService,
          API: API
        });
      $httpBackend.flush();
    }));

    it('sets the name to the SCVMM Infra Provider', function () {
      expect($scope.emsCommonModel.name).toEqual('msft');
    });

    it('sets the type to scvmm', function () {
      expect($scope.emsCommonModel.emstype).toEqual('scvmm');
    });

    it('sets the zone to default', function () {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the security protocol to ssl', function () {
      expect($scope.emsCommonModel.security_protocol).toEqual('ssl');
    });

    it('sets the default_userid', function () {
      expect($scope.emsCommonModel.default_userid).toEqual("default_user");
    });

    it('sets the default_password', function () {
      expect($scope.emsCommonModel.default_password).toEqual(miqService.storedPasswordPlaceholder);
    });

    it('sets the current tab to default', function() {
      expect($scope.currentTab).toEqual('default');
    });
  });

  describe('when the emsCommonFormId is an Openstack Id', function () {
    var emsCommonFormResponse = {
      id: 12345,
      name: 'myOpenstack',
      hostname: '10.22.33.44',
      emstype: 'openstack_infra',
      security_protocol: 'ssl',
      zone: 'default',
      api_port: '5000',
      api_version: 'v2',
      default_userid: "default_user",
      amqp_userid: "amqp_user",
      ssh_keypair_userid: "ssh_keypair_user"
    };

    beforeEach(inject(function (_$controller_) {
      $httpBackend.whenGET('/ems_infra/ems_infra_form_fields/12345').respond(emsCommonFormResponse);

      $controller = _$controller_('emsCommonFormController',
        {
          $scope: $scope,
          $attrs: {
            'formFieldsUrl': '/ems_infra/ems_infra_form_fields/',
            'createUrl': '/ems_infra',
            'updateUrl': '/ems_infra/update/'
          },
          emsCommonFormId: 12345,
          miqService: miqService,
          API: API
        });
      $httpBackend.flush();
    }));

    it('sets the name to the Openstack Infra Provider', function () {
      expect($scope.emsCommonModel.name).toEqual('myOpenstack');
    });

    it('sets the type to openstack', function () {
      expect($scope.emsCommonModel.emstype).toEqual('openstack_infra');
    });

    it('sets the hostname', function () {
      expect($scope.emsCommonModel.hostname).toEqual('10.22.33.44');
    });

    it('sets the zone to default', function () {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the default_userid', function () {
      expect($scope.emsCommonModel.default_userid).toEqual("default_user");
    });

    it('sets the default_password', function () {
      expect($scope.emsCommonModel.default_password).toEqual(miqService.storedPasswordPlaceholder);
    });

    it('sets the amqp_userid', function () {
      expect($scope.emsCommonModel.amqp_userid).toEqual("amqp_user");
    });

    it('sets the amqp_password', function () {
      expect($scope.emsCommonModel.amqp_password).toEqual(miqService.storedPasswordPlaceholder);
    });

    it('sets the ssh_keypair_userid', function () {
      expect($scope.emsCommonModel.ssh_keypair_userid).toEqual("ssh_keypair_user");
    });

    it('sets the ssh_keypair_password', function () {
      expect($scope.emsCommonModel.ssh_keypair_password).toEqual(miqService.storedPasswordPlaceholder);
    });

    it('sets the current tab to default', function() {
      expect($scope.currentTab).toEqual('default');
    });
  });

  describe('when the emsCommonFormId is a RHEV Id', function () {
    var emsCommonFormResponse = {
      id: 12345,
      name: 'myRhevm',
      hostname: '10.22.33.44',
      emstype: 'rhevm',
      zone: 'default',
      api_port: '',
      default_userid: "default_user",
    };

    beforeEach(inject(function (_$controller_) {
      $httpBackend.whenGET('/ems_infra/ems_infra_form_fields/12345').respond(emsCommonFormResponse);

      $controller = _$controller_('emsCommonFormController',
        {
          $scope: $scope,
          $attrs: {
            'formFieldsUrl': '/ems_infra/ems_infra_form_fields/',
            'createUrl': '/ems_infra',
            'updateUrl': '/ems_infra/update/'
          },
          emsCommonFormId: 12345,
          miqService: miqService,
          API: API
        });
      $httpBackend.flush();
    }));

    it('sets the name to the RHEVM Provider', function () {
      expect($scope.emsCommonModel.name).toEqual('myRhevm');
    });

    it('sets the type to openstack', function () {
      expect($scope.emsCommonModel.emstype).toEqual('rhevm');
    });

    it('sets the hostname', function () {
      expect($scope.emsCommonModel.hostname).toEqual('10.22.33.44');
    });

    it('sets the zone to default', function () {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the default_userid', function () {
      expect($scope.emsCommonModel.default_userid).toEqual("default_user");
    });

    it('sets the default_password', function () {
      expect($scope.emsCommonModel.default_password).toEqual(miqService.storedPasswordPlaceholder);
    });

    it('sets the default api port', function () {
      expect($scope.emsCommonModel.default_api_port).toEqual('');
    });

    it('sets the current tab to default', function() {
      expect($scope.currentTab).toEqual('default');
    });
  });

  describe('when the emsCommonFormId is a Kubevirt Id', function () {
    var emsCommonFormResponse = {
      id: 12345,
      name: 'myKubevirt',
      kubevirt_hostname: '10.22.33.44',
      emstype: 'kubevirt',
      zone: 'default',
      non_default_current_tab: 'kubevirt',
      kubevirt_api_port: '8443',
      kubevirt_password_exists: true,
      kubevirt_security_protocol: 'ssl-with-validation-custom-ca',
      kubevirt_tls_ca_certs: '-----BEGIN DUMMY...',
    };

    beforeEach(inject(function (_$controller_) {
      $httpBackend.whenGET('/ems_infra/ems_infra_form_fields/12345').respond(emsCommonFormResponse);

      $controller = _$controller_('emsCommonFormController',
        {
          $scope: $scope,
          $attrs: {
            'formFieldsUrl': '/ems_infra/ems_infra_form_fields/',
            'updateUrl': '/ems_infra/update/'
          },
          emsCommonFormId: 12345,
          miqService: miqService,
          API: API
        });
      $httpBackend.flush();
    }));

    it('sets the name to the Kubevirt Provider', function () {
      expect($scope.emsCommonModel.name).toEqual('myKubevirt');
    });

    it('sets the type to kubevirt', function () {
      expect($scope.emsCommonModel.emstype).toEqual('kubevirt');
    });

    it('sets the hostname', function () {
      expect($scope.emsCommonModel.kubevirt_hostname).toEqual('10.22.33.44');
    });

    it('sets the zone to default', function () {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the password', function () {
      expect($scope.emsCommonModel.kubevirt_password).toEqual(miqService.storedPasswordPlaceholder);
    });

    it('sets the kubevirt api port', function () {
      expect($scope.emsCommonModel.kubevirt_api_port).toEqual('8443');
    });

    it('sets the kubevirt security protocol', function () {
      expect($scope.emsCommonModel.kubevirt_security_protocol).toEqual('ssl-with-validation-custom-ca');
    });

    it('sets the kubevirt certificate', function () {
      expect($scope.emsCommonModel.kubevirt_tls_ca_certs).toEqual('-----BEGIN DUMMY...');
    });

    it('sets the current tab to kubevirt', function() {
      expect($scope.currentTab).toEqual('kubevirt');
    });
  });
});

describe('emsCommonFormController in the context of ems middleware provider', function () {
  var $scope, $controller, $httpBackend, miqService, compile, API;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function (_$httpBackend_, $rootScope, _$controller_, _miqService_, _$compile_, _API_) {
    miqService = _miqService_;
    API = _API_;
    compile = _$compile_;
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'restAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    spyOn(API, 'options').and.callFake(function(url){ return Promise.resolve({});});
    $scope = $rootScope.$new();

    var emsCommonFormResponse = {
      name: '',
      emstype: '',
      zone: 'default',
      emstype_vm: false,
      openstack_infra_providers_exist: false,
      default_api_port: '',
      api_version: 'v2'
    };
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('/ems_middleware/ems_middleware_form_fields/new').respond(emsCommonFormResponse);
    $controller = _$controller_('emsCommonFormController',
      {
        $scope: $scope,
        $attrs: {
          'formFieldsUrl': '/ems_middleware/ems_middleware_form_fields/',
          'createUrl': '/ems_middleware',
          'updateUrl': '/ems_middleware/12345'
        },
        emsCommonFormId: 'new',
        miqService: miqService,
        API: API
      });
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('when the emsCommonFormId is new', function () {
    beforeEach(inject(function () {
      $httpBackend.flush();
    }));

    it('sets the name to blank', function () {
      expect($scope.emsCommonModel.name).toEqual('');
    });

    it('sets the type to blank', function () {
      expect($scope.emsCommonModel.emstype).toEqual('');
    });

    it('sets the zone to default', function () {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the api_port to blank', function () {
      expect($scope.emsCommonModel.default_api_port).toEqual('');
    });
  });

  describe('when the emsCommonFormId is an Hawkular Id', function () {
    var emsCommonFormResponse = {
      id: 12345,
      name: 'SeaHawks',
      emstype: 'hawkular',
      zone: 'default',
      default_userid: "default_user"
    };

    beforeEach(inject(function (_$controller_) {
      $httpBackend.whenGET('/ems_middleware/ems_middleware_form_fields/12345').respond(emsCommonFormResponse);

      $controller = _$controller_('emsCommonFormController',
        {
          $scope: $scope,
          $attrs: {
            'formFieldsUrl': '/ems_middleware/ems_middleware_form_fields/',
            'createUrl': '/ems_middleware',
            'updateUrl': '/ems_middleware/12345'
          },
          emsCommonFormId: 12345,
          miqService: miqService,
          API: API
        });
      $httpBackend.flush();
    }));

    it('sets the name to the Hawkular Middleware Provider', function () {
      expect($scope.emsCommonModel.name).toEqual('SeaHawks');
    });

    it('sets the type to hawkular', function () {
      expect($scope.emsCommonModel.emstype).toEqual('hawkular');
    });

    it('sets the zone to default', function () {
      expect($scope.emsCommonModel.zone).toEqual('default');
    });

    it('sets the default_userid', function () {
      expect($scope.emsCommonModel.default_userid).toEqual("default_user");
    });

    it('sets the default_password', function () {
      expect($scope.emsCommonModel.default_password).toEqual(miqService.storedPasswordPlaceholder);
    });
  });
});
