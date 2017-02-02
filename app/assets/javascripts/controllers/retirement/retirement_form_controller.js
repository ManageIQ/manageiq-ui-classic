ManageIQ.angular.app.controller('retirementFormController', ['$http', '$scope', 'objectIds', 'miqService', function($http, $scope, objectIds, miqService) {
  $scope.objectIds = objectIds;
  $scope.retirementInfo = {
    retirementDate: null,
    retirementWarning: ''
  };
  $scope.datepickerStartDate = new Date();
  $scope.modelCopy = _.extend({}, $scope.retirementInfo);
  $scope.model = 'retirementInfo';

  if (objectIds.length == 1) {
    $http.get('retirement_info/' + objectIds[0])
      .then(getRetirementInfoFormData)
      .catch(miqService.handleFailure);
  }

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton('retire?button=cancel');
  };

  $scope.saveClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton('retire?button=save',
                             {'retire_date': $scope.retirementInfo.retirementDate,
                              'retire_warn': $scope.retirementInfo.retirementWarning});
  };

  function getRetirementInfoFormData(response) {
    var data = response.data;

    if (data.retirement_date != null) {
      $scope.retirementInfo.retirementDate = moment.utc(data.retirement_date, 'MM-DD-YYYY').toDate();
    }
    $scope.retirementInfo.retirementWarning = data.retirement_warning || '';
    $scope.modelCopy = _.extend({}, $scope.retirementInfo);
  }
}]);
