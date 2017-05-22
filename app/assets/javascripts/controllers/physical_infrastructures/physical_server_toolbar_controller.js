ManageIQ.angular.app.controller('physicalServerToolbarController', ['miqService', 'API', 'physicalServerId', function(miqService, API, physicalServerId) {
  var vm = this;

  ManageIQ.angular.rxSubject.subscribe(function(event) {
    vm.action = event.type;

    if (vm.action) {
      vm.servers = [];
      if (physicalServerId) {
        vm.servers = _.union(vm.servers, [physicalServerId]);
      } else {
        vm.servers = ManageIQ.gridChecks;
      }
      postPhysicalServerAction();
    }
  });

  function postPhysicalServerAction() {
    _.forEach(vm.servers, function(serverId) {
      API.post('/api/physical_servers/' + serverId, { action: vm.action })
        .then(postAction)
        .catch(miqService.handleFailure);
    });
  }

  function postAction(response) {
    miqService.miqFlashLater({ message: response.message });
    miqService.miqFlashSaved();

    // To be used later when testing with real Physical servers is complete
    // if (vm.servers.length > 1) {
    //   miqService.miqFlash('success', sprintf(__("Requested Server state %s for the selected servers"), vm.action));
    // } else {
    //   miqService.miqFlash('success', sprintf(__("Requested Server state %s for the selected server"), vm.action));
    // }
  }
}]);
