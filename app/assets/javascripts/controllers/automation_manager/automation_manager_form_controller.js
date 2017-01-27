ManageIQ.angular.app.controller('automationManagerFormController', ['$http', '$scope', 'automationManagerFormId', 'miqService', function($http, $scope, automationManagerFormId, miqService) {
    var init = function() {
      $scope.automationManagerModel = {
        name: '',
        url: '',
        zone: '',
        verify_ssl: '',
        log_userid: '',
        log_password: '',
        log_verify: ''
      };
      $scope.formId = automationManagerFormId;
      $scope.afterGet = false;
      $scope.validateClicked = miqService.validateWithAjax;
      $scope.modelCopy = angular.copy( $scope.automationManagerModel );
      $scope.model = 'automationManagerModel';

      ManageIQ.angular.scope = $scope;

      if (automationManagerFormId == 'new') {
        $scope.newRecord = true;

        $http.get('/automation_manager/automation_manager_form_fields/' + automationManagerFormId).success(function(data) {
          $scope.automationManagerModel.name = '';
          $scope.automationManagerModel.zone = data.zone;
          $scope.automationManagerModel.url = '';
          $scope.automationManagerModel.verify_ssl = false;

          $scope.automationManagerModel.log_userid = '';
          $scope.automationManagerModel.log_password = '';
          $scope.automationManagerModel.log_verify = '';
          $scope.afterGet = true;
          $scope.modelCopy = angular.copy($scope.automationManagerModel);

        });
      } else {
        $scope.newRecord = false;

        miqService.sparkleOn();

        $http.get('/automation_manager/automation_manager_form_fields/' + automationManagerFormId).success(function(data) {
          $scope.automationManagerModel.name            = data.name;
          $scope.automationManagerModel.zone            = data.zone;
          $scope.automationManagerModel.url             = data.url;
          $scope.automationManagerModel.verify_ssl      = data.verify_ssl == "1";

          $scope.automationManagerModel.log_userid   = data.log_userid;

          if($scope.automationManagerModel.log_userid != '') {
            $scope.automationManagerModel.log_password = $scope.automationManagerModel.log_verify = miqService.storedPasswordPlaceholder;
          }

          $scope.afterGet = true;
          $scope.modelCopy = angular.copy( $scope.automationManagerModel );

          miqService.sparkleOff();
        });
      }
    };

    $scope.canValidateBasicInfo = function () {
      if ($scope.isBasicInfoValid())
        return true;
      else
        return false;
    }

    $scope.isBasicInfoValid = function() {
      if($scope.angularForm.url.$valid &&
         $scope.angularForm.log_userid.$valid &&
         $scope.angularForm.log_password.$valid &&
         $scope.angularForm.log_verify.$valid)
        return true;
      else
        return false;
    };

    var automationManagerEditButtonClicked = function(buttonName, serializeFields) {
      miqService.sparkleOn();
      var url = '/automation_manager/edit/' + automationManagerFormId + '?button=' + buttonName;
      if (serializeFields === undefined) {
        miqService.miqAjaxButton(url);
      } else {
        miqService.miqAjaxButton(url, serializeFields);
      }
    };

    $scope.cancelClicked = function() {
      automationManagerEditButtonClicked('cancel');
      $scope.angularForm.$setPristine(true);
    };

    $scope.resetClicked = function() {
      $scope.$broadcast ('resetClicked');
      $scope.automationManagerModel = angular.copy( $scope.modelCopy );
      $scope.angularForm.$setPristine(true);
      miqService.miqFlash("warn", __("All changes have been reset"));
    };

    $scope.saveClicked = function() {
      automationManagerEditButtonClicked('save', true);
      $scope.angularForm.$setPristine(true);
    };

    $scope.addClicked = function() {
      $scope.saveClicked();
    };

    init();
}]);
