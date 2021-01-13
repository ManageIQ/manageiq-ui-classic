ManageIQ.angular.app.controller('orchestrationTemplateCopyController', ['$http', '$scope', 'stackId', 'miqService', function($http, $scope, stackId, miqService) {
  var vm = this;

  vm.stackId = stackId;
  vm.templateInfo = {
    templateId: null,
    templateName: null,
    templateDescription: null,
    templateDraft: null,
    templateContent: null,
  };
  vm.modelCopy = _.extend({}, vm.templateInfo);
  vm.model = 'templateInfo';
  vm.newRecord = true;
  vm.saveable = miqService.saveable;

  var otinfoUrl = '/orchestration_stack/stacks_ot_info';
  var submitUrl = '/orchestration_stack/stacks_ot_copy';

  $http.get(otinfoUrl + '/' + stackId)
    .then(getOrchestrationInfoFormData)
    .catch(miqService.handleFailure);

  $scope.$watch('vm.templateInfo.templateContent', function() {
    if (vm.templateInfo.templateContent != null) {
      var cursor = ManageIQ.editor.getDoc().getCursor();
      ManageIQ.editor.getDoc().setValue(vm.templateInfo.templateContent);
      ManageIQ.editor.getDoc().setCursor(cursor);
    }
  });

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton(submitUrl + '?button=cancel&id=' + vm.stackId);
  };

  vm.addClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton(submitUrl + '?button=add', vm.templateInfo);
  };

  function getOrchestrationInfoFormData(response) {
    var data = response.data;

    vm.templateInfo.templateId = data.template_id;
    vm.templateInfo.templateName = 'Copy of ' + data.template_name;
    vm.templateInfo.templateDescription = data.template_description;
    vm.templateInfo.templateDraft = data.template_draft;
    vm.templateInfo.templateContent = data.template_content;
    vm.modelCopy = _.extend({}, vm.templateInfo);
  }
}]);
