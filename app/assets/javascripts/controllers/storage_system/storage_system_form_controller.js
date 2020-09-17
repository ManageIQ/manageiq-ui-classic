// copied from plugins\manageiq-ui-classic\app\assets\javascripts\controllers\host\host_form_controller.js
ManageIQ.angular.app.controller(
  'storageSystemFormController',
    ['$http', '$scope', '$attrs', 'storageSystemFormId', 'miqService', 'API', 'storageManagerId',
    function ($http, $scope, $attrs, storageSystemFormId, miqService, API, storageManagerId) {
      var self = this;

      var init = function () {
        self.$scope = $scope
        $scope.storageSystemModel = {
          name: '',
          storage_resource_id: null,
          validate_id: null,

        };
        $scope.storageSystemFamilies = [];
        $scope.modelCopy = angular.copy($scope.storageSystemModel);
        $scope.afterGet = false;
        $scope.formId = storageSystemFormId;
        $scope.validateClicked = miqService.validateWithAjax;
        $scope.formFieldsUrl = $attrs.formFieldsUrl;
        $scope.updateUrl = $attrs.updateUrl;
        $scope.model = 'storageSystemModel';
        ManageIQ.angular.scope = $scope;

        if (storageSystemFormId === 'new') {
          $scope.newRecord = true;
          if (storageManagerId) {
            $scope.storageSystemModel.ems_id = storageManagerId;
            $scope.emsIdChanged(storageManagerId);
          }
          $scope.storageSystemModel.name = '';
          $scope.storageSystemModel.storage_resource_id = null;
          $scope.storageSystemModel.validate_id = null;
          $scope.afterGet = true;
        } else if (storageSystemFormId.split(',').length === 1) {
          miqService.sparkleOn();
          $http.get($scope.formFieldsUrl + storageSystemFormId)
            .then(getStorageSystemFormDataComplete)
            .catch(miqService.handleFailure);
        } else if (storageSystemFormId.split(',').length > 1) {
          $scope.afterGet = true;
        }

        $scope.currentTab = 'default';
      };

      $scope.changeAuthTab = function (id) {
        $scope.currentTab = id;
      };

      /*          handlers       */

      $scope.cancelClicked = function () {
        miqService.sparkleOn();
        var url;
        if (storageSystemFormId.split(',').length === 1) {
          url = $scope.updateUrl + storageSystemFormId + '?button=cancel';
        } else if (storageSystemFormId.split(',').length > 1) {
          url = $scope.updateUrl + '?button=cancel';
        }
        miqService.miqAjaxButton(url);
      };


      $scope.addClicked = function () {
        miqService.sparkleOn();
        if (storageSystemFormId.split(',').length > 1) {
          var url = $scope.updateUrl + '?button=add';
        } else {
          var url = $scope.updateUrl + storageSystemFormId + '?button=add';
        }
        miqService.miqAjaxButton(url, $scope.storageSystemModel);
      };

      $scope.saveClicked = function () {
        miqService.sparkleOn();
        if (storageSystemFormId.split(',').length > 1) {
          var url = $scope.updateUrl + '?button=save';
        } else {
          var url = $scope.updateUrl + storageSystemFormId + '?button=save';
        }
        miqService.miqAjaxButton(url, true);
      };

      $scope.resetClicked = function () {
        $scope.$broadcast('resetClicked');
        $scope.storageSystemModel = angular.copy($scope.modelCopy);
        $scope.angularForm.$setUntouched(true);
        $scope.angularForm.$setPristine(true);
        miqService.miqFlash('warn', __('All changes have been reset'));
      };

      $scope.emsIdChanged = function (emsId) {
        miqService.sparkleOn();

        API.get('/api/providers/' + emsId + '?attributes=type,storage_system_families', null)
          .then(getStorageManagerFormData)
          .catch(miqService.handleFailure);

      };

      var getStorageManagerFormData = function (data) {
        $scope.storageSystemFamilies = data.storage_system_families;
        $scope.storageSystemModel.emstype = data.type
        miqService.sparkleOff();
      }


      /*                        validation                    */

      $scope.isBasicInfoValid = function () {
        if ($scope.currentTab === 'default' && fieldValidity('default')) {
          return true;
        } else if ($scope.currentTab === 'remote' && fieldValidity('remote')) {
          return true;
        } else if ($scope.currentTab === 'ws' && fieldValidity('ws')) {
          return true;
        } else if ($scope.currentTab === 'ipmi' && fieldValidity('ipmi')) {
          return true;
        }
        return false;
      };

      function fieldValidity(fieldPrefix) {
        return true
      }

      $scope.canValidate = function () {
        if ($scope.isBasicInfoValid() && $scope.validateFieldsDirty()) {
          return true;
        }
        return false;
      };

      $scope.canValidateBasicInfo = function () {
        if ($scope.isBasicInfoValid()) {
          return true;
        }
        return false;
      };

      $scope.validateFieldsDirty = function () {
        return true;
      };

      function getStorageSystemFormDataComplete(response) {
        var data = response.data;

        $scope.storageSystemModel.name = data.name;
        $scope.storageSystemModel.storage_resource_id = data.storage_resource_id;
        $scope.storageSystemModel.management_ip = data.management_ip
        $scope.storageSystemModel.ems_id = data.ems_id
        $scope.storageSystemModel.storage_system_family_id = data.storage_system_family_id
        $scope.storageSystemModel.password = data.password
        $scope.storageSystemModel.user = data.user

        $scope.afterGet = true;

        $scope.modelCopy = angular.copy($scope.storageSystemModel);
        miqService.sparkleOff();
      }

      init();
    }]);
