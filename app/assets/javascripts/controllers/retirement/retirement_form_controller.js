ManageIQ.angular.app.controller('retirementFormController', ['$http', 'objectIds', 'miqService', function($http, objectIds, miqService) {
  var vm = this;
  vm.objectIds = objectIds;
  vm.retirementInfo = {
    retirementDate: null,
    retirementWarning: ''
  };
  vm.datepickerStartDate = new Date();
  vm.modelCopy = _.extend({}, vm.retirementInfo);
  vm.model = 'retirementInfo';

  if (objectIds.length == 1) {
    $http.get('/' + ManageIQ.controller + '/retirement_info/' + objectIds[0])
      .then(getRetirementInfoFormData)
      .catch(miqService.handleFailure);
  }

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton('/' + ManageIQ.controller + '/retire?button=cancel');
  };

  vm.saveClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton('/' + ManageIQ.controller + '/retire?button=save',
                             {'retire_date': vm.retirementInfo.retirementDate,
                              'retire_warn': vm.retirementInfo.retirementWarning});
  };

  function getRetirementInfoFormData(response) {
    var data = response.data;

    if (data.retirement_date != null) {
      vm.retirementInfo.retirementDate = moment.utc(data.retirement_date).toDate();
    }
    vm.retirementInfo.retirementWarning = data.retirement_warning || '';
    vm.modelCopy = _.extend({}, vm.retirementInfo);
  }
}]);
