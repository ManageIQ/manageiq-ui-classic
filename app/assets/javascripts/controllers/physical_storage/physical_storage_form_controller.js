// copied from plugins\manageiq-ui-classic\app\assets\javascripts\controllers\host\host_form_controller.js
ManageIQ.angular.app.controller(
  'physicalStorageFormController',
    ['$http', '$scope', '$attrs', 'physicalStorageFormId', 'miqService', 'API',
    function ($http, $scope, $attrs, physicalStorageFormId, miqService, API) {
      var self = this;

      var init = function () {
        self.$scope = $scope
        $scope.physicalStorageModel = {
          name: '',
          storage_resource_id: null,
          validate_id: null,

        };
        $scope.physicalStorageTypes = [];

        $scope.modelCopy = angular.copy($scope.physicalStorageModel);
        $scope.afterGet = false;
        $scope.formId = physicalStorageFormId;
        $scope.validateClicked = miqService.validateWithAjax;
        $scope.formFieldsUrl = $attrs.formFieldsUrl;
        $scope.updateUrl = $attrs.updateUrl;
        $scope.model = 'physicalStorageModel';
        ManageIQ.angular.scope = $scope;

        if (physicalStorageFormId === 'new') {
          $scope.newRecord = true;
          $scope.physicalStorageModel.name = '';
          $scope.physicalStorageModel.storage_resource_id = null;
          $scope.physicalStorageModel.validate_id = null;
          $scope.afterGet = true;
        } else if (physicalStorageFormId.split(',').length === 1) {
          miqService.sparkleOn();
          $http.get($scope.formFieldsUrl + physicalStorageFormId)
            .then(getPhysicalStorageFormDataComplete)
            .catch(miqService.handleFailure);
        } else if (physicalStorageFormId.split(',').length > 1) {
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
        if (physicalStorageFormId.split(',').length === 1) {
          url = $scope.updateUrl + physicalStorageFormId + '?button=cancel';
        } else if (physicalStorageFormId.split(',').length > 1) {
          url = $scope.updateUrl + '?button=cancel';
        }
        miqService.miqAjaxButton(url);
      };


      $scope.addClicked = function () {
        miqService.sparkleOn();
        if (physicalStorageFormId.split(',').length > 1) {
          var url = $scope.updateUrl + '?button=add';
        } else {
          var url = $scope.updateUrl + physicalStorageFormId + '?button=add';
        }
        miqService.miqAjaxButton(url, $scope.physicalStorageModel);
      };

      $scope.saveClicked = function () {
        miqService.sparkleOn();
        if (physicalStorageFormId.split(',').length > 1) {
          var url = $scope.updateUrl + '?button=save';
        } else {
          var url = $scope.updateUrl + physicalStorageFormId + '?button=save';
        }
        miqService.miqAjaxButton(url, true);
      };

      $scope.resetClicked = function () {
        $scope.$broadcast('resetClicked');
        $scope.physicalStorageModel = angular.copy($scope.modelCopy);
        $scope.angularForm.$setUntouched(true);
        $scope.angularForm.$setPristine(true);
        miqService.miqFlash('warn', __('All changes have been reset'));
      };

      $scope.emsIdChanged = function (emsId) {
        miqService.sparkleOn();

        API.get('/api/providers/' + emsId + '?attributes=type,physical_storage_types', null)
          .then(getStorageManagerFormData)
          .catch(miqService.handleFailure);

      };

      var getStorageManagerFormData = function (data) {
        $scope.physicalStorageTypes = data.physical_storage_types;
        $scope.physicalStorageModel.emstype = data.type
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

      function getPhysicalStorageFormDataComplete(response) {
        var data = response.data;

        $scope.physicalStorageModel.name = data.name;
        $scope.physicalStorageModel.storage_resource_id = data.storage_resource_id;
        $scope.physicalStorageModel.management_ip = data.management_ip
        $scope.physicalStorageModel.ems_id = data.ems_id
        $scope.physicalStorageModel.physical_storage_type_id = data.physical_storage_type_id
        $scope.physicalStorageModel.password = data.password
        $scope.physicalStorageModel.user = data.user

        $scope.afterGet = true;

        $scope.modelCopy = angular.copy($scope.physicalStorageModel);
        miqService.sparkleOff();
      }

      init();
    }]);
