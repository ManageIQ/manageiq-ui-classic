ManageIQ.angular.app.controller('orchestrationTemplateCopyController', ['$http', '$scope', 'stackId', 'miqService', function($http, $scope, stackId, miqService) {
  $scope.stackId = stackId;
  $scope.templateInfo = {
    templateId: null,
    templateName: null,
    templateDescription: null,
    templateDraft: null,
    templateContent: null
  };
  $scope.modelCopy = _.extend({}, $scope.templateInfo);
  $scope.model = 'templateInfo';
  $scope.newRecord = true;
  $scope.saveable = miqService.saveable;

  var otinfoUrl = '/orchestration_stack/stacks_ot_info';
  var submitUrl = '/orchestration_stack/stacks_ot_copy';

  $http.get(otinfoUrl + '/' + stackId)
    .then(getOrchestrationInfoFormData)
    .catch(miqService.handleFailure);

  $scope.$watch('templateInfo.templateContent', function() {
    if ($scope.templateInfo.templateContent != null) {
      var cursor = ManageIQ.editor.getDoc().getCursor();
      ManageIQ.editor.getDoc().setValue($scope.templateInfo.templateContent);
      ManageIQ.editor.getDoc().setCursor(cursor);
    }
  });

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton(submitUrl + '?button=cancel&id=' + $scope.stackId);
  };

  $scope.addClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton(submitUrl + '?button=add', $scope.templateInfo);
  };

  function getOrchestrationInfoFormData(response) {
    var data = response.data;

    $scope.templateInfo.templateId = data.template_id;
    $scope.templateInfo.templateName = "Copy of " + data.template_name;
    $scope.templateInfo.templateDescription = data.template_description;
    $scope.templateInfo.templateDraft = data.template_draft;
    $scope.templateInfo.templateContent = data.template_content;
    $scope.modelCopy = _.extend({}, $scope.templateInfo);
  }
}]);
