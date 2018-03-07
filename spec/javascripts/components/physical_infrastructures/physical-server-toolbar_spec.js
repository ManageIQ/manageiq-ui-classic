describe('physical-server-toolbar', function() {
  var $scope, $componentController, toolbar, API;

  describe('physicalServerToolbar on show page', function () {

    beforeEach(module('ManageIQ'));
    beforeEach(inject(function ($compile, $rootScope, _$componentController_, _API_, $q) {
      $componentController = _$componentController_;
      API = _API_;
      $scope = $rootScope;

      var deferred = $q.defer();
      spyOn(API, 'post').and.callFake(function() {return deferred.promise;});

      var bindings = {physicalServerId: 1};
      toolbar = $componentController('physicalServerToolbar', null, bindings);

      sendDataWithRx({type: 'power_on', controller: 'physicalServerToolbarController'});
    }));

    it('sets action to "power_on"', function () {
      expect(toolbar.action).toEqual('power_on');
    });

    it('sets physicalServerId and toolbar.servers', function () {
      expect(toolbar.physicalServerId).toEqual(1);
      expect(toolbar.servers).toEqual([1]);
    });

    it('calls API.post with the appropriate URL', function () {
      expect(API.post).toHaveBeenCalledWith('/api/physical_servers/1', { action: toolbar.action });
    });
  });

  describe('physicalServerToolbar on show list page', function () {

    beforeEach(module('ManageIQ'));
    beforeEach(inject(function ($compile, $rootScope, _$componentController_, _API_, $q) {
      $componentController = _$componentController_;
      API = _API_;
      $scope = $rootScope;

      var deferred = $q.defer();
      spyOn(API, 'post').and.callFake(function() {return deferred.promise;});

      ManageIQ.gridChecks = [1,2];
      toolbar = $componentController('physicalServerToolbar', null, {});

      sendDataWithRx({type: 'blink_loc_led', controller: 'physicalServerToolbarController'});
    }));

    it('sets action to "blink_loc_led"', function () {
      expect(toolbar.action).toEqual('blink_loc_led');
    });

    it('sets toolbar.servers', function () {
      expect(toolbar.servers).toEqual([1,2]);
    });

    it('calls API.post with the appropriate URL', function () {
      expect(API.post).toHaveBeenCalledWith('/api/physical_servers/1', { action: toolbar.action });
      expect(API.post).toHaveBeenCalledWith('/api/physical_servers/2', { action: toolbar.action });
    });
  });
});
