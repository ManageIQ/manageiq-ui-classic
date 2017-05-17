ManageIQ.angular.app.controller('retirementFormController', ['$http', 'objectIds', 'miqService', function($http, objectIds, miqService) {
  var vm = this;
  vm.objectIds = objectIds;
  vm.retirementInfo = {
    date: null,
    warning: ''
  };
  vm.datepickerStartDate = new Date();
  vm.modelCopy = _.extend({}, vm.retirementInfo);
  vm.model = 'retirementInfo';

  if (objectIds.length == 1) {
    $http.get('retirement_info/' + objectIds[0])
      .then(getRetirementInfoFormData)
      .catch(miqService.handleFailure);
  }

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton('retire?button=cancel');
  };

  vm.saveClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton('retire?button=save', vm.retirementInfo);
  };

  function getRetirementInfoFormData(response) {
    var data = response.data;

    if (data.retirement_date != null) {
      vm.retirementInfo.retirementDate = moment.utc(data.retirement_date, 'MM-DD-YYYY').toDate();
    }
    vm.retirementInfo.retirementWarning = data.retirement_warning || '';
    vm.modelCopy = _.extend({}, vm.retirementInfo);
  }
}]);
