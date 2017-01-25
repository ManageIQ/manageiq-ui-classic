ManageIQ.angular.app.controller('ansibleTowerFormController', ['$http', '$scope', 'ansibleTowerFormId', 'miqService', function($http, $scope, ansibleTowerFormId, miqService) {
    var init = function() {
      $scope.ansibleTowerModel = {
        name: '',
        url: '',
        zone: '',
        verify_ssl: '',
        log_userid: '',
        log_password: '',
        log_verify: ''
      };
      $scope.formId = ansibleTowerFormId;
      $scope.afterGet = false;
      $scope.validateClicked = miqService.validateWithAjax;
      $scope.modelCopy = angular.copy( $scope.ansibleTowerModel );
      $scope.model = 'ansibleTowerModel';

      ManageIQ.angular.scope = $scope;

      if (ansibleTowerFormId == 'new') {
        $scope.newRecord = true;

        $http.get('/ansible_tower/ansible_tower_form_fields/' + ansibleTowerFormId).success(function(data) {
          $scope.ansibleTowerModel.name = '';
          $scope.ansibleTowerModel.zone = data.zone;
          $scope.ansibleTowerModel.url = '';
          $scope.ansibleTowerModel.verify_ssl = false;

          $scope.ansibleTowerModel.log_userid = '';
          $scope.ansibleTowerModel.log_password = '';
          $scope.ansibleTowerModel.log_verify = '';
          $scope.afterGet = true;
          $scope.modelCopy = angular.copy($scope.ansibleTowerModel);

        });
      } else {
        $scope.newRecord = false;

        miqService.sparkleOn();

        $http.get('/ansible_tower/ansible_tower_form_fields/' + ansibleTowerFormId).success(function(data) {
          $scope.ansibleTowerModel.name            = data.name;
          $scope.ansibleTowerModel.zone            = data.zone;
          $scope.ansibleTowerModel.url             = data.url;
          $scope.ansibleTowerModel.verify_ssl      = data.verify_ssl == "1";

          $scope.ansibleTowerModel.log_userid   = data.log_userid;

          if($scope.ansibleTowerModel.log_userid != '') {
            $scope.ansibleTowerModel.log_password = $scope.ansibleTowerModel.log_verify = miqService.storedPasswordPlaceholder;
          }

          $scope.afterGet = true;
          $scope.modelCopy = angular.copy( $scope.ansibleTowerModel );

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

    var ansibleTowerEditButtonClicked = function(buttonName, serializeFields) {
      miqService.sparkleOn();
      var url = '/ansible_tower/edit/' + ansibleTowerFormId + '?button=' + buttonName;
      if (serializeFields === undefined) {
        miqService.miqAjaxButton(url);
      } else {
        miqService.miqAjaxButton(url, serializeFields);
      }
    };

    $scope.cancelClicked = function() {
      ansibleTowerEditButtonClicked('cancel');
      $scope.angularForm.$setPristine(true);
    };

    $scope.resetClicked = function() {
      $scope.$broadcast ('resetClicked');
      $scope.ansibleTowerModel = angular.copy( $scope.modelCopy );
      $scope.angularForm.$setPristine(true);
      miqService.miqFlash("warn", __("All changes have been reset"));
    };

    $scope.saveClicked = function() {
      ansibleTowerEditButtonClicked('save', true);
      $scope.angularForm.$setPristine(true);
    };

    $scope.addClicked = function() {
      $scope.saveClicked();
    };

    init();
}]);
