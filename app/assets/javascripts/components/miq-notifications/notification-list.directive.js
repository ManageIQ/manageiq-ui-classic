angular.module('miq.notifications').directive('miqNotificationList', function () {
  'use strict';

  return {
    restrict: 'E',
    controller: NotificationListController,
    templateUrl: '/static/miq-notifications/notification-list.html'
  };

  function NotificationListController ($scope, $rootScope) {
    $scope.notifications = $rootScope.notifications;
  }
});
