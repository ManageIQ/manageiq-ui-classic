ManageIQ.angular.app.component('logDepotSettings', {
  bindings: {
    show: '<',
    requeredDepotName: '<',
    modelDepotName: '@',
    requeredUri: '<',
    modelUri: '@',
    modelUriPrefix: '@',
    uriPrefixDisplay: '@',
    readonlySet: '<',
    nameChangeValue: '<',
    uriChangeValue: '<',
  },
  controllerAs: 'vm',
  controller: logDepotSettingsController,
  templateUrl: '/static/ops/edit_log_depot_settings.html.haml',
});
function logDepotSettingsController() {
  var vm = this;
  vm.$onInit = function() {
    if (vm.readonlySet === undefined) {
      vm.readOnlySet = false;
    };
  };
  vm.nameChanged = function() {
    vm.nameChangeValue(vm.modelDepotName);
  };
  vm.uriChanged = function() {
    vm.uriChangeValue(vm.modelUri);
  };
};

