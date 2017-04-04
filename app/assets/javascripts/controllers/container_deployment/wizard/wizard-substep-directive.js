angular.module('miq.wizard').directive('miqWizardSubstep', function() {
  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    scope: {
      stepTitle: '@',
      stepId: '@',
      stepPriority: '@',
      nextEnabled: '=?',
      prevEnabled: '=?',
      nextTooltip: '=?',
      prevTooltip: '=?',
      okToNavAway: '=?',
      allowClickNav: '=?',
      disabled: '@?wzDisabled',
      description: '@',
      wizardData: '=',
      onShow: '=?',
      showReviewDetails: '@?',
      reviewTemplate: '@?'
    },
    require: '^miq-wizard-step',
    templateUrl: '/static/wizard-substep.html',
    controller: ['$scope', function($scope) {
      if ($scope.nextEnabled === undefined) {
        $scope.nextEnabled = true;
      }
      if ($scope.prevEnabled === undefined) {
        $scope.prevEnabled = true;
      }
      if ($scope.nextTooltip === undefined) {
        $scope.nextEnabled = true;
      }
      if ($scope.prevToolitp === undefined) {
        $scope.prevEnabled = true;
      }
      if ($scope.showReviewDetails === undefined) {
        $scope.showReviewDetails = false;
      }
      if ($scope.stepPriority === undefined) {
        $scope.stepPriority = 999;
      } else {
        $scope.stepPriority = parseInt($scope.stepPriority);
      }
      if ($scope.okToNavAway === undefined) {
        $scope.okToNavAway = true;
      }
      if ($scope.allowClickNav === undefined) {
        $scope.allowClickNav = true;
      }

      $scope.isPrevEnabled = function () {
        var enabled = $scope.prevEnabled === undefined || $scope.prevEnabled;
        if ($scope.substeps) {
          angular.forEach($scope.getEnabledSteps(), function(step) {
            enabled = enabled && step.prevEnabled;
          });
        }
        return enabled;
      };

    }],
    link: function($scope, $element, $attrs, step) {
      $scope.title = $scope.stepTitle;
      step.addStep($scope);
    }
  };
});
