ManageIQ.angular.app.controller('evmRelationshipFormController', ['$q', '$scope', 'evmRelationshipFormId', 'controllerName', 'miqService', 'postService', 'API', function($q, $scope, evmRelationshipFormId, controllerName, miqService, postService, API) {
  var vm = this;
  var url = '/' + controllerName + '/explorer';
  var init = function() {
    vm.evmRelationshipModel = {
      miq_server: '',
    };

    vm.server_options = {};
    vm.select_options = [];
    vm.afterGet  = false;
    vm.newRecord = false;
    vm.model     = 'evmRelationshipModel';
    vm.saveable = miqService.saveable;

    ManageIQ.angular.scope = vm;

    miqService.sparkleOn();
    vm.newRecord = false;

    // get list of servers
    var optionsPromise = API.get('/api/servers/?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending')
      .then(getServerOptions)
      .catch(miqService.handleFailure);

    var dataPromise = API.get('/api/vms/' + evmRelationshipFormId + '/?attributes=miq_server')
      .then(getEvmRelationshipFormData)
      .catch(miqService.handleFailure);

    $q.all([optionsPromise, dataPromise])
      .then(retrievedDetails);

    miqService.sparkleOff();
  };

  function getServerOptions(response) {
    Object.assign(vm.server_options, response.resources);
    for (var opt in vm.server_options) {
      vm.select_options.push({'value': vm.server_options[opt].id, 'label': vm.server_options[opt].name + ' (' + vm.server_options[opt].id + ')'});
    }
  }

  function getEvmRelationshipFormData(response) {
    if (typeof response.miq_server !== 'undefined')
      vm.evmRelationshipModel.miq_server = response.miq_server.id;
    vm.modelCopy = angular.copy( vm.evmRelationshipModel );
  }

  function retrievedDetails() {
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var message = sprintf(__('Edit of ManageIQ Server Relationship cancelled by user.'));
    postService.cancelOperation(url, message);
    $scope.angularForm.$setPristine(true);
  };

  vm.resetClicked = function() {
    miqService.resetData(vm, 'evmRelationshipModel', $scope);
  };

  vm.saveClicked = function() {
    var successMsg = sprintf(__('Management Engine Relationship saved'));
    postService.saveRecord('/api/vms/' + evmRelationshipFormId,
      url,
      setResources(vm.evmRelationshipModel),
      successMsg,
      'set_miq_server');
    $scope.angularForm.$setPristine(true);
  };

  function setResources(data) {
    var serverId = {};
    if (data.miq_server !== null)
      serverId = {'id': data.miq_server};

    return {'miq_server': serverId};
  }

  init();
}]);
