angular.module('miq.notifications').directive('miqNotificationList', function () {
  'use strict';

  return {
    restrict: 'E',
    controller: NotificationListController,
    templateUrl: '/static/miq-notifications/notification-list.html'
  };

  NotificationListController.$inject = ['$scope', '$rootScope'];
  function NotificationListController ($scope, $rootScope) {
    $scope.notifications = $rootScope.notifications;
  }
});
