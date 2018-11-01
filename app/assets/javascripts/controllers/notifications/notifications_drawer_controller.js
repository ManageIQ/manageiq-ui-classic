angular.module('miq.notifications').controller('notificationsDrawerController', ['$scope', 'eventNotifications', '$timeout', function($scope, eventNotifications, $timeout) {
  var vm = this;
  var cookieId = 'miq-notification-drawer';
  vm.notificationGroups = [];
  vm.drawerExpanded = sessionStorage.getItem(cookieId + '-expanded') === 'true';
  vm.notificationsDrawerShown = eventNotifications.state().drawerShown;

  var watchExpanded = $scope.$watch('vm.drawerExpanded', function() {
    sessionStorage.setItem(cookieId + '-expanded', vm.drawerExpanded);
  });

  var addGroupWatchers = function() {
    angular.forEach(vm.notificationGroups, function(group, index) {
      if (group.watcher) {
        group.watcher();
      }
      group.watcher = $scope.$watch(function() {
        return vm.notificationGroups[index];
      }, function(newVal) {
        sessionStorage.setItem(cookieId + '-' + newVal.notificationType + '-open', newVal.open);
      }, true);
    });
  };

  var clearGroupWatchers = function() {
    angular.forEach(vm.notificationGroups, function(group) {
      if (_.isFunction(group.watcher)) {
        group.watcher();
      }
    });
  };

  var updatePosition = function() {
    var hasVerticalScrollbar,
      scrollContent = angular.element('#main-content'),
      miqNotificationsDrawer = angular.element('#miq-notifications-drawer .drawer-pf');
    if (scrollContent && scrollContent.length === 1 && miqNotificationsDrawer && miqNotificationsDrawer.length === 1) {
      hasVerticalScrollbar = scrollContent[0].scrollHeight > scrollContent[0].clientHeight;
      if (hasVerticalScrollbar) {
        angular.element(miqNotificationsDrawer).addClass('vertical-scroll');
      } else {
        angular.element(miqNotificationsDrawer).removeClass('vertical-scroll');
      }
    }
  };

  var watchPositioning = function() {
    var scrollContent = angular.element('#main-content');
    if (scrollContent && scrollContent.length === 1) {
      updatePosition();
      scrollContent.off('resize', updatePosition);
      scrollContent.on('resize', updatePosition);
    }
  };

  var refreshNotifications = function() {
    clearGroupWatchers();

    vm.notificationGroups = eventNotifications.state().groups;
    angular.forEach($scope.notificationGroups, function(group) {
      group.open = sessionStorage.getItem(cookieId + '-' + group.notificationType + '-open') === 'true';
    });

    addGroupWatchers();
  };

  var refresh = function() {
    $timeout(function() {
      refreshNotifications();
      vm.notificationsDrawerShown = eventNotifications.state().drawerShown;
    });
  };

  var destroy = function() {
    eventNotifications.unregisterObserverCallback(refresh);
    groupsWatcher();
    clearGroupWatchers();
    watchExpanded();
  };

  eventNotifications.registerObserverCallback(refresh);

  $scope.$on('$destroy', destroy);

  if (vm.notificationsDrawerShown) {
    angular.element(document).ready(watchPositioning);
  }
  angular.element(window).resize(watchPositioning);

  vm.customScope = {};

  vm.customScope.getNotficationStatusIconClass = function(notification) {
    var retClass = '';
    if (notification && notification.type) {
      if (notification.type === 'info') {
        retClass = 'pficon pficon-info';
      } else if ((notification.type === 'error') || (notification.type === 'danger')) {
        retClass = 'pficon pficon-error-circle-o';
      } else if (notification.type === 'warning') {
        retClass = 'pficon pficon-warning-triangle-o';
      } else if ((notification.type === 'success') || (notification.type === 'ok')) {
        retClass = 'pficon pficon-ok';
      }
    }

    return retClass;
  };

  vm.customScope.markNotificationRead = function(notification, group) {
    eventNotifications.markRead(notification, group);
  };

  vm.customScope.viewNotificationDetails = function(notification, group) {
    if (notification.data.link) {
      eventNotifications.viewDetails(notification, group);
    }
  };

  vm.customScope.clearNotification = function(notification, group) {
    eventNotifications.clear(notification, group);
  };

  vm.customScope.markAllRead = function(group) {
    eventNotifications.markAllRead(group);
  };
  vm.customScope.clearAllNotifications = function(group) {
    eventNotifications.clearAll(group);
  };

  vm.customScope.unreadCountText = function(count) {
    return sprintf(__('%d New'), count);
  };

  refresh();
}]);

