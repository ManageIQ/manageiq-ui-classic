describe('retirementForm', function () {
  var $componentController, vm, miqService, $httpBackend;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function (_$componentController_, _miqService_, _$httpBackend_) {
    $componentController = _$componentController_;
    miqService = _miqService_;
    $httpBackend = _$httpBackend_;
    spyOn(miqService, 'miqFlash');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    var bindings = { objectIds: ["12121212"] };
    vm = $componentController('retirementForm', null, bindings);
    vm.$onInit();
    var retirementResponse = {
      retirement_date: moment.utc('12/31/2015').toDate(),
      retirement_warning: '0',
    }
    $httpBackend.whenGET('/' + ManageIQ.controller + '/retirement_info/12121212').respond(retirementResponse);
    $httpBackend.flush();
  })
  )

  afterEach(function () {
    ManageIQ.controller = null;
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  })

  describe('initialization', function () {
    it('sets the retirementDate to the value returned with http request', function () {
      expect(vm.retirementInfo.retirementDate).toEqual(new Date('2015-12-31'));
    })

    it('sets the retirementWarning to the value returned with http request', function () {
      expect(vm.retirementInfo.retirementWarning).toEqual('0');
    })

    it('sets the modelCopy', function () {
      var expectedModel = {
        retirementDate: new Date('2015-12-31'),
        retirementWarning: '0',
      }
      expect(vm.modelCopy).toEqual(expectedModel);
    })
  })

  describe('#cancelClick', function () {
    beforeEach(function () {
      vm.cancelClicked();
    })

    it('turns the spinner on via the miqService', function () {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    })

    it('turns the spinner twice via the miqService', function () {
      expect(miqService.sparkleOn.calls.count()).toBe(2);
    })

    it('delegates miqService ajaxButton', function () {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/' + ManageIQ.controller + '/retire?button=cancel');
    })
  })

  describe('#saveClick', function () {
    beforeEach(function () {
      vm.saveClicked();
    })

    it('turns the spinner on via the miqService', function () {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    })

    it('turns the spinner twice via the miqService', function () {
      expect(miqService.sparkleOn.calls.count()).toBe(2);
    })

    it('delegates miqService ajaxButton', function () {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/' + ManageIQ.controller + '/retire?button=save',
        {
          'retire_date': vm.retirementInfo.retirementDate,
          'retire_warn': vm.retirementInfo.retirementWarning
        });
    })
  })

  describe('#resetClick', function () {
    beforeEach(function () {
      vm.retirementInfo = {
        retirement_date: moment.utc('1/1/2016').toDate(),
        retirement_warning: '1',
      };
      $scope.angularForm = {
        $setPristine: function (value) {
          this.$pristine = value;
        },
        $pristine: false,
      };
      vm.resetClicked($scope.angularForm);
    })

    it('turns the spinner on via the miqService', function () {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    })

    it('turns the spinner twice via the miqService', function () {
      expect(miqService.sparkleOn.calls.count()).toBe(2);
    })

    it('sets pristine on true', function () {
      expect($scope.angularForm.$pristine).toBe(true);
    })

    it('sets flash message to be a warning with correct message', function () {
      expect(miqService.miqFlash).toHaveBeenCalledWith("warn", "All changes have been reset");
    })

    it('sets vm.retirementInfo to vm.modelCopy', function () {
      expect(vm.retirementInfo).toEqual(vm.modelCopy);
    })
  })
})
