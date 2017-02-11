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
    var userid;

    if ($scope.$parent.vm) {
      userid = $scope.$parent.vm.modelCopy[userid];
    } else {
      userid = $scope.modelCopy[userid];
    }

    return !vm.newRecord && userid !== '';
  };

  vm.resetClicked = function() {
    vm.newRecord = false;
    vm.cancelPasswordChange();
  };
}]);
