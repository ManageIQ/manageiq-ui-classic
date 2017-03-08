describe('catalogItemFormController', function() {
  var $scope, $controller, postService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, $location, _$controller_, miqService, _postService_, catalogItemDataFactory) {
    postService = _postService_;
    spyOn(miqService, 'showButtons');
    spyOn(miqService, 'hideButtons');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    spyOn(postService, 'cancelOperation');
    spyOn(postService, 'saveRecord');
    spyOn(postService, 'createRecord');
    $scope = $rootScope.$new();
    $scope.vm = {};
    $scope.vm.catalogItemModel = {
      name:                         'catalogItemName',
      description:                  'catalogItemDescription',
      service_template_catalog_id:  10000000000012,
      display:                      true,
      prov_type: 'generic_ansible_playbook',
      type: 'ServiceTemplateAnsiblePlaybook',
      config_info:                  {
        provision: {
          dialog_id:     '10000000000031',
          repository_id: undefined,
          playbook_id:          10000000000493,
          credential_id:        10000000000090,
          hosts:                undefined,
          extra_vars:           {
            'var1': 'default_val1',
            'var2': 'default_val2'
          },
          network_credential_id: undefined,
          cloud_credential_id: undefined
        }
      }
    };

    spyOn(catalogItemDataFactory, 'getCatalogItemData').and.returnValue(Promise.resolve($scope.vm.catalogItemModel));

    $controller = _$controller_('catalogItemFormController', {
      $scope: $scope,
      catalogItemFormId: 1000000000001
    });
  }));

  var redirectUrl = '/catalog/explorer';

  describe('initialization', function() {
    it('sets the catalogItemData name to the value returned via the http request', function(done) {
      setTimeout(function () {
        expect($scope.vm.catalogItemModel.name).toEqual('catalogItemName');
        expect($scope.vm.catalogItemModel.description).toEqual('catalogItemDescription');
        done();
      });
    });
  });

  describe('#playbookChanged', function() {
    describe('when the provisioning playbook changes', function() {
      beforeEach(function() {
        $scope.vm = {};
        $scope.vm.catalogItemModel = {
          name: 'catalogItemName',
          description: 'catalogItemDescription',
          service_template_catalog_id: 10000000000012,
          display: true,
          prov_type: 'generic_ansible_playbook',
          type: 'ServiceTemplateAnsiblePlaybook',
          config_info: {
            provision: {
              dialog_id: '10000000000031',
              repository_id: undefined,
              playbook_id: 10000000000493,
              credential_id: 10000000000090,
              hosts: undefined,
              network_credential_id: 10000000000091,
              cloud_credential_id: 10000000000092
            }
          },
          provisioning_repository_id: '',
          provisioning_playbook_id: '',
          provisioning_machine_credential_id: '',
          provisioning_network_credential_id: '',
          provisioning_cloud_credential_id: '',
          provisioning_key: '',
          provisioning_value: '',
          provisioning_variables: {},
          provisioning_editMode: false,
          provisioning_cloud_type: '',
          retirement_repository_id: '',
          retirement_playbook_id: '',
          retirement_machine_credential_id: '',
          retirement_network_credential_id: '',
          retirement_cloud_credential_id: '',
          retirement_inventory: 'localhost',
          retirement_dialog_existing: 'existing',
          retirement_dialog_id: '',
          retirement_dialog_name: '',
          retirement_key: '',
          retirement_value: '',
          retirement_variables: {},
          retirement_editMode: false,
          retirement_cloud_type: '',
          cloud_types: ["Amazon", "Azure", "Google", "Openstack", "Vmware"]
        }
        $scope.vm.provisioning_machine_credentials = {};
        $scope.vm.provisioning_network_credentials = {};
        $scope.vm.provisioning_cloud_credentials = {};
      });

      it('resets the provisioning credentials', function() {
        //$scope.vm.playbookChanged('provisioning', 10000000000600 );
        expect($scope.vm.catalogItemModel.provisioning_machine_credential_id).toEqual('');
        expect($scope.vm.catalogItemModel.provisioning_cloud_credential_id).toEqual('');
        expect($scope.vm.catalogItemModel.provisioning_cloud_type).toEqual('');
        expect($scope.vm['provisioning_cloud_credentials']).toEqual({});
        expect($scope.vm['provisioning_network_credentials']).toEqual({});
        expect($scope.vm['provisioning_machine_credentials']).toEqual({});
      });
    });

    describe('when the retirement playbook changes', function() {
      beforeEach(function() {
        $scope.vm = {};
        $scope.vm.catalogItemModel = {
          name: 'catalogItemName',
          description: 'catalogItemDescription',
          service_template_catalog_id: 10000000000012,
          display: true,
          prov_type: 'generic_ansible_playbook',
          type: 'ServiceTemplateAnsiblePlaybook',
          config_info: {
            retire: {
              dialog_id: '10000000000031',
              repository_id: undefined,
              playbook_id: 10000000000693,
              credential_id: 10000000000190,
              hosts: undefined,
              network_credential_id: 10000000000191,
              cloud_credential_id: 10000000000192,
            }
          },
          provisioning_repository_id: '',
          provisioning_playbook_id: '',
          provisioning_machine_credential_id: '',
          provisioning_network_credential_id: '',
          provisioning_cloud_credential_id: '',
          provisioning_key: '',
          provisioning_value: '',
          provisioning_variables: {},
          provisioning_editMode: false,
          provisioning_cloud_type: '',
          retirement_repository_id: '',
          retirement_playbook_id: '',
          retirement_machine_credential_id: '',
          retirement_network_credential_id: '',
          retirement_cloud_credential_id: '',
          retirement_inventory: 'localhost',
          retirement_dialog_existing: 'existing',
          retirement_dialog_id: '',
          retirement_dialog_name: '',
          retirement_key: '',
          retirement_value: '',
          retirement_variables: {},
          retirement_editMode: false,
          retirement_cloud_type: '',
          cloud_types: ["Amazon", "Azure", "Google", "Openstack", "Vmware"]
        }
        $scope.vm.retirement_machine_credentials = {};
        $scope.vm.retirement_network_credentials = {};
        $scope.vm.retirement_cloud_credentials = {};
      });

      it('resets the retirement credentials', function() {
        //playbookChanged('provisioning', 10000000000600 );
        expect($scope.vm.catalogItemModel['retirement_machine_credential_id']).toEqual('');
        expect($scope.vm.catalogItemModel['retirement_cloud_credential_id']).toEqual('');
        expect($scope.vm.catalogItemModel['retirement_cloud_type']).toEqual('');
        expect($scope.vm['retirement_cloud_credentials']).toEqual({});
        expect($scope.vm['retirement_network_credentials']).toEqual({});
        expect($scope.vm['retirement_machine_credentials']).toEqual({});
      });
    });
  });

  describe('#cancelClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      setTimeout($scope.cancelClicked);
    });

    it('delegates to postService.cancelOperation', function(done) {
      setTimeout(function () {
        var msg = "Edit of Catalog Item catalogItemDescription was cancelled by the user";
        expect(postService.cancelOperation).toHaveBeenCalledWith(redirectUrl + "?", msg);
        done();
      });
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function() {
      $scope.vm.catalogItemModel.name = 'catalogItemName';
      $scope.angularForm = {
        $setPristine: function (value){},
        $setUntouched: function (value){},
      };
      setTimeout($scope.resetClicked);
    });

    it('resets value of name field to initial value', function(done) {
      setTimeout(function() {
        expect($scope.vm.catalogItemModel.name).toEqual('catalogItemName');
        done();
      });
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function() {
      setTimeout($scope.saveClicked);
    });

    it('delegates to postService.saveRecord', function(done) {
      setTimeout(function() {
        expect(postService.saveRecord).toHaveBeenCalledWith(
          '/api/service_templates/1000000000001',
          redirectUrl + '/1000000000001?button=save',
          $scope.vm.catalogItemModel,
          'Catalog Item catalogItemName was saved'
        );
        done();
      });
    });
  });

  describe('#addClicked', function() {
    beforeEach(function () {
      setTimeout($scope.addClicked);
    });

    it('delegates to postService.createRecord', function (done) {
      setTimeout(function () {
        expect(postService.createRecord).toHaveBeenCalledWith(
          '/api/service_templates',
          redirectUrl + '/1000000000001?button=add',
          $scope.vm.catalogItemModel,
          'Catalog Item catalogItemName was added'
        );
        done();
      });
    });
  });
});
