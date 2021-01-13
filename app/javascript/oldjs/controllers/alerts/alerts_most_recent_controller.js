/* global miqSparkleOn, miqSparkleOff */

angular.module('ManageIQ').controller('alertsMostRecentController',
  ['$window', 'alertsCenterService', '$interval',
    function($window, alertsCenterService, $interval) {
      var vm = this;

      vm.alertsList = [];
      vm.loadingDone = false;
      miqSparkleOn();

      function processData(response) {
        var updatedAlerts = alertsCenterService.convertToAlertsList(response);

        // update display data for the alerts from the current alert settings
        angular.forEach(updatedAlerts, function(nextUpdate) {
          var matchingAlert = _.find(vm.alerts, function(existingAlert) {
            return nextUpdate.id === existingAlert.id;
          });

          if (matchingAlert) {
            nextUpdate.isExpanded = matchingAlert.isExpanded;
          }
        });

        vm.alerts = updatedAlerts;
        vm.loadingDone = true;
        vm.filterChange();
        miqSparkleOff();
      }

      function setupConfig() {
        vm.acknowledgedTooltip = __('Acknowledged');

        vm.showCount = 25;
        vm.showCounts = [25, 50, 100];

        vm.severities = alertsCenterService.severities;

        vm.listConfig = {
          showSelectBox: false,
          selectItems: false,
          useExpandingRows: true,
        };

        vm.menuActions = alertsCenterService.menuActions;
        vm.updateMenuActionForItemFn = alertsCenterService.updateMenuActionForItemFn;

        vm.objectTypes = [];
        vm.currentFilters = alertsCenterService.getFiltersFromLocation($window.location.search,
          alertsCenterService.alertListSortFields);

        vm.filterConfig = {
          fields: alertsCenterService.alertListFilterFields,
          resultsCount: vm.alertsList.length,
          appliedFilters: vm.currentFilters,
          onFilterChange: vm.filterChange,
        };


        vm.sortConfig = {
          fields: alertsCenterService.alertListSortFields,
          onSortChange: sortChange,
          isAscending: true,
        };

        // Default sort descending by severity
        vm.sortConfig.currentField = vm.sortConfig.fields[1];
        vm.sortConfig.isAscending = false;

        vm.toolbarConfig = {
          filterConfig: vm.filterConfig,
          sortConfig: vm.sortConfig,
          actionsConfig: {
            actionsInclude: true,
          },
        };
      }

      vm.filterChange = function() {
        vm.alertsList = [];

        // Sort by update time descending
        vm.alerts.sort(function(alert1, alert2) {
          return (alert2.evaluated_on - alert1.evaluated_on);
        });

        vm.alertsList = alertsCenterService.filterAlerts(vm.alerts, vm.filterConfig.appliedFilters);

        vm.toolbarConfig.filterConfig.resultsCount = vm.alertsList.length;

        /* Make sure sorting is maintained */
        sortChange();
      };

      function sortChange() {
        if (vm.alertsList) {
          vm.alertsList.sort(function(item1, item2) {
            return alertsCenterService.compareAlerts(item1,
              item2,
              vm.toolbarConfig.sortConfig.currentField.id,
              vm.toolbarConfig.sortConfig.isAscending);
          });
        }
      }

      function getAlerts() {
        alertsCenterService.updateAlertsData(vm.showCount, 0, 'evaluated_on', false).then(processData);

        if (alertsCenterService.refreshInterval > 0) {
          $interval(
            function() {
              alertsCenterService.updateAlertsData(vm.showCount, 0, 'evaluated_on', false).then(processData);
            },
            alertsCenterService.refreshInterval
          );
        }
      }

      vm.showHostPage = function(item, event) {
        event.stopImmediatePropagation();
        $window.location.href = item.hostLink;
      };

      vm.showObjectPage = function(item, event) {
        event.stopImmediatePropagation();
        $window.location.href = item.objectLink;
      };

      alertsCenterService.registerObserverCallback(vm.filterChange);

      setupConfig();
      getAlerts();
    },
  ]);
