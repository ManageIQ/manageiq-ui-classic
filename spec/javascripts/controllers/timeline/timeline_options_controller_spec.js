describe('timelineOptionsController', function() {
  var $scope, $controller, $httpBackend, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, _miqService_) {
    miqService = _miqService_;
    spyOn(miqService, 'showButtons');
    spyOn(miqService, 'hideButtons');
    spyOn(miqService, 'buildCalendar');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    $scope = $rootScope.$new();
    spyOn($scope, '$broadcast');
    $httpBackend = _$httpBackend_;
    vm = _$controller_('timelineOptionsController', {
      $scope: $scope,
      keyPairFormId: 'new',
      url: '/host/tl_chooser',
      categories: [],
      miqService: miqService,
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('count increment', function() {
    it('should increment the count', function() {
      vm.countIncrement();
      expect(vm.reportModel.tl_range_count).toBe(2);
    });

    it('should decrement the count', function() {
      vm.reportModel.tl_range_count = 10;
      vm.countDecrement();
      expect(vm.reportModel.tl_range_count).toBe(9);
    });
  });

  describe('options update', function() {
    it('should update the type to be hourly', function() {
      vm.reportModel.tl_timerange = 'days';
      vm.applyButtonClicked();
      expect(vm.reportModel.tl_typ).toBe('Hourly');
    });

    it('should update the type to be daily', function() {
      vm.reportModel.tl_timerange = 'weeks';
      vm.applyButtonClicked();
      expect(vm.reportModel.tl_typ).toBe('Daily');
    });

    it('should update the miq_date correctly', function() {
      vm.reportModel.tl_timerange = 'days';
      vm.reportModel.tl_range_count = 10;
      var timeLineDate = new Date('2016-04-01');
      vm.reportModel.tl_date = new Date(timeLineDate.getTime() + (timeLineDate.getTimezoneOffset() * 60000));
      vm.reportModel.tl_timepivot = 'starting';
      vm.applyButtonClicked();
      expect(vm.reportModel.miq_date).toBe('04/11/2016');
    });

    it('should update the miq_date correctly based on centered', function() {
      vm.reportModel.tl_timerange = 'days';
      vm.reportModel.tl_range_count = 10;
      var timeLineDate = new Date('2016-04-01');
      vm.reportModel.tl_date = new Date(timeLineDate.getTime() + (timeLineDate.getTimezoneOffset() * 60000));
      vm.reportModel.tl_timepivot = 'centered';
      vm.applyButtonClicked();
      expect(vm.reportModel.miq_date).toBe('04/06/2016');
    });
  });
});
