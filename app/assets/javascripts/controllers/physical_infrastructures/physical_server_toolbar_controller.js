ManageIQ.angular.app.controller('physicalServerToolbarController', ['miqService', 'API', 'physicalServerId', function(miqService, API, physicalServerId) {
  var vm = this;

  vm.physicalServerToolbarModel = {
    servers: [],
  };

  vm.supportedActions = [
    'power_on',
    'power_off',
    'restart',
    'blink_loc_led',
    'turn_on_loc_led',
    'turn_off_loc_led',
  ];

  ManageIQ.angular.rxSubject.subscribe(function(event) {
    var action = event.type;

    if (event.rowSelect && event.rowSelect.checked) {
      vm.physicalServerToolbarModel.servers = _.union(vm.physicalServerToolbarModel.servers, [event.rowSelect.long_id]);
    } else if (event.rowSelect && !event.rowSelect.checked) {
      _.remove(vm.physicalServerToolbarModel.servers, function (serverId) {
        return serverId === event.rowSelect.long_id;
      });
    }

    if (_.indexOf(vm.supportedActions, action) != -1) {
      if (physicalServerId) {
        vm.physicalServerToolbarModel.servers = _.union(vm.physicalServerToolbarModel.servers, [physicalServerId]);
      }
      postPhysicalServerAction(action);
    }
  });

  function postPhysicalServerAction(action) {
    _.forEach(vm.physicalServerToolbarModel.servers, function(serverId) {
      API.post('/api/physical_servers/' + serverId, { action: action })
        .then(postAction)
        .catch(miqService.handleFailure);
    });
  }

  function postAction(response) {
    miqService.miqFlashLater({ message: response.message });
    miqService.miqFlashSaved();
  }
}]);
