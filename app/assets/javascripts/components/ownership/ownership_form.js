ManageIQ.angular.app.component('ownershipFormComponent', {
  bindings: {
    objectIds: '<'
  },

  controllerAs: 'vm',
  controller: [ '$http', 'miqService', function($http, miqService){
   var vm = this;

  vm.$onInit = () => {
  console.log("ownership");
    vm.ownershipModel = {
      user: '',
      group: ''
    };
    vm.afterGet  = false;
    vm.newRecord = false;
    vm.modelCopy = angular.copy( vm.ownershipModel );
    vm.model     = "ownershipModel";
    vm.saveable = miqService.saveable;
    ManageIQ.angular.scope = vm;
    miqService.sparkleOn();

   console.log(vm.objectIds)
   $http.post('ownership_form_fields', {object_ids: vm.objectIds})
      .then(getOwnershipFormData)
      .catch(miqService.handleFailure);
  };


    function getOwnershipFormData(response) {
    var data = response.data;

    vm.ownershipModel.user = data.user;
    vm.ownershipModel.group = data.group;
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.ownershipModel );
    miqService.sparkleOff();



  var ownershipEditButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = 'ownership_update/' + '?button=' + buttonName;
    if (serializeFields === undefined) {
      miqService.miqAjaxButton(url);
    } else {
      miqService.miqAjaxButton(url, {
        objectIds: vm.objectIds,
        user: vm.ownershipModel.user,
        group: vm.ownershipModel.group
      });
    }
  };
  }

  vm.isBasicInfoValid = function() {
    return ( vm.angularForm.user && vm.angularForm.user.$valid) &&
          (vm.angularForm.group && vm.angularForm.group.$valid);
  };


  vm.cancelClicked = function() {
    ownershipEditButtonClicked('cancel');
    vm.angularForm.$setPristine(true);
  };

  vm.resetClicked = function() {
    vm.ownershipModel = angular.copy( vm.modelCopy );
    vm.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  vm.saveClicked = function() {
    ownershipEditButtonClicked('save', true);
  };

  vm.addClicked = function() {
    vm.saveClicked();
  };

  function getOwnershipFormData(response) {
    var data = response.data;

    vm.ownershipModel.user = data.user;
    vm.ownershipModel.group = data.group;
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.ownershipModel );
    miqService.sparkleOff();
  }

  }],
  templateUrl: '/static/shared/ownership.html.haml',

})
