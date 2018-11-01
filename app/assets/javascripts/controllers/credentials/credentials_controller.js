ManageIQ.angular.app.controller('CredentialsController', ['$scope', '$attrs', function($scope, $attrs) {
  var vm = this;

  vm.vmScope = function() {
    return $scope.$eval($attrs.vmScope);
  };

  vm.bChangeStoredPassword = undefined;
  vm.bCancelPasswordChange = undefined;

  $scope.$on('resetClicked', function(_e) {
    vm.resetClicked();
  });

  $scope.$on('setNewRecord', function(_event, args) {
    vm.vmScope().newRecord = args ? args.newRecord : true;
  });

  $scope.$on('setUserId', function(_event, args) {
    if (args) {
      vm.vmScope().modelCopy[args.userIdName] = args.userIdValue;
    }
  });

  if (vm.vmScope().formId == 'new') {
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
    return vm.vmScope().newRecord || (! vm.showChangePasswordLinks(userid)) || vm.bChangeStoredPassword;
  };

  vm.showChangePasswordLinks = function(userid) {
    return ! vm.vmScope().newRecord && vm.vmScope().modelCopy[userid] != '';
  };

  vm.resetClicked = function() {
    vm.newRecord = false;
    vm.cancelPasswordChange();
  };
}]);
