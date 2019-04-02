angular.module('miq.notifications').controller('toastListController', ['$scope', 'eventNotifications', '$timeout', function($scope, eventNotifications, $timeout) {
  var vm = this;
  vm.toastNotifications = [];

  vm.handleCloseToast = function(notification) {
    eventNotifications.markRead(notification);
    eventNotifications.dismissToast(notification);
  };

  vm.updateViewing = function(viewing, notification) {
    eventNotifications.setViewingToast(notification, viewing);
  };

  var refresh = function() {
    $timeout(function() {
      vm.toastNotifications = eventNotifications.state().toastNotifications;
    });
  };

  var destroy = function() {
    eventNotifications.unregisterObserverCallback(refresh);
  };

  eventNotifications.registerObserverCallback(refresh);

  $scope.$on('$destroy', destroy);

  refresh();
}]);
