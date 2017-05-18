ManageIQ.angular.app.controller('physicalServerToolbarController', ['miqService', 'API', function(miqService, API) {
  var vm = this;

  vm.physicalServerToolbarModel = {
    servers: [],
  };

  vm.supportedActions = [
    'power_on',
  ];

  ManageIQ.angular.rxSubject.subscribe(function(event) {
    var action = event.type;

    if (event.rowSelect && event.rowSelect.checked) {
      vm.physicalServerToolbarModel.servers.push(event.rowSelect.long_id)
    } else if (event.rowSelect && !event.rowSelect.checked) {
      _.remove(vm.physicalServerToolbarModel.servers, function (serverId) {
        return serverId === event.rowSelect.long_id;
      });
    }

    if (_.indexOf(vm.supportedActions, action) != -1) {
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
    miqFlashLater({ message: response.message });
    miqFlashSaved();
  }
}]);
