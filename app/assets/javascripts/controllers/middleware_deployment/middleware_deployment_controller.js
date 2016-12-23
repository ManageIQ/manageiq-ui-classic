ManageIQ.angular.app.controller('mwAddDeploymentController', MwAddDeploymentController);

MwAddDeploymentController.$inject = ['$scope', '$http', 'miqService'];

function MwAddDeploymentController($scope, $http, miqService) {

  $scope.$on('mwAddDeploymentEvent', function(event, data) {

    var fd = new FormData();
    fd.append('file', data.filePath);
    fd.append('id', data.serverId);
    fd.append('enabled', data.enableDeployment);
    fd.append('forceDeploy', data.forceDeploy);
    fd.append('runtimeName', data.runtimeName);
    var isGroupDeployment = data.isGroupDeployment;
    var path = '/middleware_server' + (isGroupDeployment ? '_group' : '') + '/add_deployment';
    $http.post(path, fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    })
      .then(
        function(result) { // success
          miqService.miqFlash(result.data.status, result.data.msg);
        },
        function() { // error
          miqService.miqFlash('error', 'Unable to deploy "' + data.runtimeName + '" on this server' +
              (isGroupDeployment ? ' group' : '') +'.');
        })
      .finally(function() {
        angular.element("#modal_d_div").modal('hide');
        miqService.sparkleOff();
      });
  });
}
