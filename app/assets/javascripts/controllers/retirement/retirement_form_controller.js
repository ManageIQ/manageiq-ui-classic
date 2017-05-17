ManageIQ.angular.app.controller('retirementFormController', ['$http', 'objectIds', 'miqService', function($http, objectIds, miqService) {
  var vm = this;

  var defaults = {
    date: null,
    warning: 0,
  };

  vm.retirementInfo = angular.copy(defaults);
  vm.model = 'retirementInfo';
  vm.modelCopy = angular.copy(vm.retirementInfo);

  vm.datepickerStartDate = new Date();

  if (objectIds.length === 1) {
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

  vm.clearDate = function() {
    angular.extend(vm.retirementInfo, defaults);
  };

  function getRetirementInfoFormData(response) {
    angular.extend(vm.retirementInfo, response.data);
    vm.modelCopy = angular.copy(vm.retirementInfo);
  }
}]);
