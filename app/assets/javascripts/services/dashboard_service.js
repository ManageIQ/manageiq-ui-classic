/* global miqAjaxButton miqBuildCalendar miqButtons miqJqueryRequest miqRESTAjaxButton miqSparkleOff miqSparkleOn
 add_flash miqFlashLater miqFlashSaved */

ManageIQ.angular.app.service('dashboardService', ['$http', '$interval', '$window', 'miqService', function($http, $interval, $window, miqService) {
  this.autoUpdateDashboard = function($scope, baseURL, callback) {
    $scope.refresh = function() {
      // get the pathname and remove trailing / if exist
      var pathname = $window.location.pathname.replace(/\/$/, '');
      if (pathname.match(/show$/)) {
        $scope.id = '';
      } else if (pathname.match(/^\/[^\/]+\/show\/(\d+)/)) {
        // search for pattern ^/<controler>/show/<id>$ in the pathname
        $scope.id = '/' + (/^\/[^\/]+\/show\/(\d+)/.exec(pathname)[1]);
      } else {
        // search for pattern ^/<controler>/<id>$ in the pathname
        $scope.id = '/' + (/^\/[^\/]+\/(\d+)$/.exec(pathname)[1]);
      }

      var url = baseURL + $scope.id;
      $http.get(url)
        .then(callback)
        .catch(miqService.handleFailure);
    };

    $scope.refresh();
    var promise = $interval($scope.refresh, 1000 * 60 * 3);

    $scope.$on('$destroy', function() {
      $interval.cancel(promise);
    });
  };
}]);
