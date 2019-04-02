ManageIQ.angular.app.component('retirementForm', {
  bindings: {
    objectIds: '<',
  },
  controllerAs: 'vm',
  controller: ['$http', 'miqService', function($http, miqService) {
    var vm = this;

    vm.$onInit = function() {
      if (vm.objectIds.length === 1) {
        miqService.sparkleOn();
        vm.saveable = miqService.saveable;
        $http.get('/' + ManageIQ.controller + '/retirement_info/' + vm.objectIds[0])
          .then(getRetirementInfoFormData)
          .catch(miqService.handleFailure);
      }
    };

    vm.select_options = [
      {
        'value': '',
        'label': _('None'),
      },
      {
        'value': 7,
        'label': _('1 Week before retirement'),
      },
      {
        'value': 14,
        'label': _('2 Weeks before retirement'),
      },
      {
        'value': 30,
        'label': _('30 Days before retirement'),
      },
    ];

    vm.retirementInfo = {
      retirementDate: null,
      retirementWarning: '',
    };

    vm.datepickerStartDate = new Date();

    vm.modelCopy = _.extend({}, vm.retirementInfo);

    vm.model = 'retirementInfo';

    vm.cancelClicked = function() {
      miqService.sparkleOn();
      miqService.miqAjaxButton('/' + ManageIQ.controller + '/retire?button=cancel');
    };

    vm.saveClicked = function() {
      miqService.sparkleOn();
      miqService.miqAjaxButton('/' + ManageIQ.controller + '/retire?button=save', {
        'retire_date': vm.retirementInfo.retirementDate,
        'retire_warn': vm.retirementInfo.retirementWarning,
      });
    };

    vm.resetClicked = function(angularForm) {
      miqService.sparkleOn();
      vm.retirementInfo = angular.copy( vm.modelCopy );
      angularForm.$setPristine(true);
      miqService.miqFlash('warn', __('All changes have been reset'));
      miqService.sparkleOff();
    };

    function getRetirementInfoFormData(response) {
      var data = response.data;

      if (data.retirement_date != null) {
        vm.retirementInfo.retirementDate = new Date(data.retirement_date);
      }
      vm.retirementInfo.retirementWarning = data.retirement_warning || '';
      vm.modelCopy = _.extend({}, vm.retirementInfo);
      miqService.sparkleOff();
    }
  }],
  templateUrl: '/static/retirement-form.html.haml',
});
