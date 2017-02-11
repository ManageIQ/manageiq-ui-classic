ManageIQ.angular.app.controller('buttonGroupController', ['miqService', function(miqService) {
  var vm = this;

  vm.saveable = miqService.saveable;
  vm.disabledClick = miqService.disabledClick;
  vm.addText = __("Add");
  vm.saveText = __("Save");
  vm.resetText = __("Reset");
  vm.cancelText = __("Cancel");
}]);
