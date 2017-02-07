ManageIQ.angular.app.controller('CredentialsController', ['$scope', function($scope) {
  var vm = this;

  vm.bChangeStoredPassword = undefined;
  vm.bCancelPasswordChange = undefined;

  $scope.$on('resetClicked', function(_e) {
    vm.resetClicked();
  });

  $scope.$on('setNewRecord', function(_event, args) {
    vm.newRecord = args ? args.newRecord : true;
  });

  $scope.$on('setUserId', function(_event, args) {
    if (args) {
      vm.modelCopy[args.userIdName] = args.userIdValue;
    }
  });

  if (vm.formId == 'new') {
    vm.newRecord = true;
  } else {
    vm.newRecord = false;
    vm.bChangeStoredPassword = false;
    vm.bCancelPasswordChange = false;
  }

  vm.changeStoredPassword = function() {
    vm.bChangeStoredPassword = true;
    vm.bCancelPasswordChange = false;
  };

  vm.cancelPasswordChange = function() {
    if (vm.bChangeStoredPassword) {
      vm.bCancelPasswordChange = true;
      vm.bChangeStoredPassword = false;
    }
  };

  vm.showVerify = function(userid) {
    return vm.newRecord || (!vm.showChangePasswordLinks(userid)) || vm.bChangeStoredPassword;
  };

  vm.showChangePasswordLinks = function(userid) {
    return !vm.newRecord && $scope.modelCopy[userid] != '';
  };

  vm.resetClicked = function() {
    vm.newRecord = false;
    vm.cancelPasswordChange();
  };
}]);
