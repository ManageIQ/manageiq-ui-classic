describe('catalogItemFormController', function() {
  var $scope, $controller, currentRegion, postService, allCatalogsNames, additionalTenantIds;

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
      long_description:             'catalogItemLongDescription',
      display:                      true,
      service_template_catalog_id:  10000000000012,
      zone_id:                      10000000000001,
      prov_type: 'generic_ansible_playbook',
      type: 'ServiceTemplateAnsiblePlaybook',
      additional_tenant_ids: additionalTenantIds,
      currency_id: '',
      price: '',
      config_info:                  {
        provision: {
          dialog_id:     '10000000000031',
          repository_id: undefined,
          playbook_id:          10000000000493,
          credential_id:        10000000000090,
          vault_credential_id:  10000000000100,
          execution_ttl:         100,
          hosts:                'localhost',
          verbosity:            '0',
          log_output:           'on_error',
          extra_vars:           {
            'var1': {'default': 'default_val1'},
            'var2': {'default': 'default_val2'}
          },
          become_enabled: false,
          network_credential_id: undefined
        },
        retirement: {
          remove_resources: 'yes_without_playbook',
          verbosity:        '0',
          log_output:       'on_error',
        }
      }
    };

    spyOn(catalogItemDataFactory, 'getCatalogItemData').and.returnValue(Promise.resolve($scope.vm.catalogItemModel));

    $controller = _$controller_('catalogItemFormController', {
      $scope: $scope,
      currentRegion: currentRegion,
      allCatalogsNames: allCatalogsNames,
      additionalTenantIds: additionalTenantIds,
      catalogItemFormId: 1000000000001
    });
  }));

  var redirectUrl = '/catalog/explorer';

  describe('initialization', function() {
    it('sets the catalogItemData name to the value returned via the http request', function(done) {
      setTimeout(function () {
        expect($controller.catalogItemModel.name).toEqual($scope.vm.catalogItemModel.name);
        expect($controller.catalogItemModel.description).toEqual($scope.vm.catalogItemModel.description);
        expect($controller.catalogItemModel.provisioning_dialog_id).toEqual($scope.vm.catalogItemModel.config_info.provision.dialog_id);
        done();
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
