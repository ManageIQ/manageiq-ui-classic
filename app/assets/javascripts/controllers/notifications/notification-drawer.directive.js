angular.module('ManageIQ').directive('miqNotificationDrawer', ['$window', '$timeout', function($window, $timeout) {
  'use strict';
  return {
    restrict: 'A',
    scope: {
      drawerHidden: '=?',
      allowExpand: '=?',
      drawerExpanded: '=?',
      drawerTitle: '@',
      notificationGroups: '=',
      actionButtonTitle: '@',
      actionButtonCallback: '=?',
      customScope: '=?',
    },
    templateUrl: '/static/notification_drawer/notification-drawer.html',
    controller: ['$scope', function($scope) {
      if (!$scope.allowExpand || angular.isUndefined($scope.drawerExpanded)) {
        $scope.drawerExpanded = false;
      }

      $scope.limit = { notifications: 100 };

      $scope.closeDrawer = function() {
        sendDataWithRx({
          controller: 'HeaderCtrl',
          action: 'closeDrawer',
        });
      };
    }],
    link: function(scope, element) {
      scope.$watch('notificationGroups', function() {
        var openFound = false;
        scope.notificationGroups.forEach(function(group) {
          if (group.open) {
            if (openFound) {
              group.open = false;
            } else {
              openFound = true;
            }
          }
        });
      });

      scope.$watch('drawerHidden', updateAccordionSizing);

      function updateAccordionSizing() {
        $timeout(function() {
          angular.element($window).triggerHandler('resize');
        }, 100);
      }

      scope.toggleCollapse = function(selectedGroup) {
        if (selectedGroup.open) {
          selectedGroup.open = false;
        } else {
          scope.notificationGroups.forEach(function(group) {
            group.open = false;
          });
          selectedGroup.open = true;
        }

        updateAccordionSizing();
      };

      scope.toggleExpandDrawer = function() {
        scope.drawerExpanded = !scope.drawerExpanded;
      };

      if (scope.groupHeight) {
        element.find('.panel-group').css('height', scope.groupHeight);
      }
      if (scope.groupClass) {
        element.find('.panel-group').addClass(scope.groupClass);
      }
    },
  };
}]);
