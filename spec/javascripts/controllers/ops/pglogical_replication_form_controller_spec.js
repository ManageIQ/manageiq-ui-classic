describe('pglogicalReplicationFormController', function() {
  var $scope, vm, $httpBackend, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, _$controller_, _$httpBackend_, _miqService_) {
    miqService = _miqService_;
    spyOn(miqService, 'showButtons');
    spyOn(miqService, 'hideButtons');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;

    var pglogicalReplicationFormResponse = {
      replication_type: 'none',
      subscriptions   : [],
      exclusion_list  : ""
    };

    $httpBackend.whenGET('/ops/pglogical_subscriptions_form_fields/new').respond(pglogicalReplicationFormResponse);
    vm = _$controller_('pglogicalReplicationFormController', {
      $scope: $scope,
      pglogicalReplicationFormId: 'new',
      miqService: miqService
    });

    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('initialization', function() {
    it('sets the replication type returned with http request', function() {
      expect(vm.pglogicalReplicationModel.replication_type).toEqual('none');
    });

    it('sets the subscriptions value returned with http request', function() {
      expect(vm.pglogicalReplicationModel.subscriptions).toEqual([]);
    });

    it('sets the exclusion list to the value returned by the http request', function() {
      expect(vm.pglogicalReplicationModel.exclusion_list).toEqual("");
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){},
        $setUntouched: function (value){}
      };
      vm.resetClicked();
    });

    it('sets total spinner count to be 1', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(1);
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      vm.saveClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('delegates to miqService.miqAjaxButton', function() {
      var submitContent = {
        replication_type: vm.pglogicalReplicationModel.replication_type,
        subscriptions:    vm.pglogicalReplicationModel.subscriptions,
        exclusion_list:   vm.pglogicalReplicationModel.exclusion_list};

      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/ops/pglogical_save_subscriptions/new?button=save', submitContent);
    });
  });
});
