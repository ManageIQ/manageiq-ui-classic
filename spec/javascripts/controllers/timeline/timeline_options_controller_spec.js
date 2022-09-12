describe('timelineOptionsController', function() {
    var $scope, $controller, $httpBackend, miqService;

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
        $controller = _$controller_('timelineOptionsController', {
            $scope: $scope,
            keyPairFormId: 'new',
            url: '/host/tl_chooser',
            categories: [],
            miqService: miqService,
            record_type: ""
        });
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('count increment', function() {
        it('should increment the count', function() {
            $controller.countIncrement();
            expect($controller.reportModel.tl_range_count).toBe(2);
        });

        it('should decrement the count', function() {
            $controller.reportModel.tl_range_count = 10;
            $controller.countDecrement();
            expect($controller.reportModel.tl_range_count).toBe(9);
        });
    });

    describe('options update', function() {
        it('should update the type to be hourly', function() {
            $controller.reportModel.tl_timerange = 'days';
            $controller.applyButtonClicked();
            expect($controller.reportModel.tl_typ).toBe('Hourly');
        });

        it('should update the type to be daily', function() {
            $controller.reportModel.tl_timerange = 'weeks';
            $controller.applyButtonClicked();
            expect($controller.reportModel.tl_typ).toBe('Daily');
        });

        it('should update the miq_date correctly', function() {
            $controller.reportModel.tl_timerange = 'days';
            $controller.reportModel.tl_range_count = 10;
            var timeLineDate = new Date('2016-04-01')
            $controller.reportModel.tl_date = new Date(timeLineDate.getTime() + (timeLineDate.getTimezoneOffset() * 60000));
            $controller.reportModel.tl_timepivot = 'starting';
            $controller.applyButtonClicked();
            expect($controller.reportModel.miq_date).toBe('04/11/2016');
        });

        it('should update the miq_date correctly based on centered', function() {
            $controller.reportModel.tl_timerange = 'days';
            $controller.reportModel.tl_range_count = 10;
            var timeLineDate = new Date('2016-04-01')
            $controller.reportModel.tl_date = new Date(timeLineDate.getTime() + (timeLineDate.getTimezoneOffset() * 60000));
            $controller.reportModel.tl_timepivot = 'centered';
            $controller.applyButtonClicked();
            expect($controller.reportModel.miq_date).toBe('04/06/2016');
        });
    });
});
