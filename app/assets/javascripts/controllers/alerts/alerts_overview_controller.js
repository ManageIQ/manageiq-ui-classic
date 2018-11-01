/* global miqHttpInject */

angular.module('alertsCenter').controller('alertsOverviewController',
  ['$window', 'alertsCenterService', '$interval', '$timeout',
    function($window, alertsCenterService, $interval, $timeout) {
      var vm = this;
      vm.alertData = [];
      vm.loadingDone = false;

      function setupInitialValues() {
        document.getElementById('center_div').className += ' miq-body';

        setupConfig();

        // Default sort ascending by error count
        vm.sortConfig.currentField = vm.sortConfig.fields[0];
        vm.sortConfig.isAscending = false;

        // Default to unfiltered
        vm.filterConfig.appliedFilters = [];
      }

      function setupConfig() {
        vm.category = alertsCenterService.categories[0];

        vm.unGroupedGroup =         {
          value: __('Ungrouped'),
          title: __('Ungrouped'),
          itemsList: [],
          open: true,
        };

        vm.groups = [vm.unGroupedGroup];

        vm.cardsConfig = {
          selectItems: false,
          multiSelect: false,
          dblClick: false,
          selectionMatchProp: 'name',
          showSelectBox: false,
        };

        vm.filterConfig = {
          fields: [
            {
              id: 'severityCount',
              title: __('Severity'),
              placeholder: __('Filter by Severity'),
              filterType: 'select',
              filterValues: alertsCenterService.severityTitles,
            },
            {
              id: 'name',
              title: __('Name'),
              placeholder: __('Filter by Name'),
              filterType: 'text',
            },
            {
              id: 'objectType',
              title: __('Type'),
              placeholder: __('Filter by Type'),
              filterType: 'select',
              filterValues: alertsCenterService.objectTypes,
            },
          ],
          resultsCount: 0,
          appliedFilters: [],
          onFilterChange: vm.filterChange,
        };

        vm.sortConfig = {
          fields: [
            {
              id: 'errors',
              title: __('Error Count'),
              sortType: 'numeric',
            },
            {
              id: 'warnings',
              title: __('Warning Count'),
              sortType: 'numeric',
            },
            {
              id: 'infos',
              title: __('Information Count'),
              sortType: 'numeric',
            },
            {
              id: 'object_name',
              title: __('Object Name'),
              sortType: 'alpha',
            },
            {
              id: 'object_type',
              title: __('Object Type'),
              sortType: 'alpha',
            },
          ],
          onSortChange: sortChange,
          isAscending: true,
        };

        vm.toolbarConfig = {
          filterConfig: vm.filterConfig,
          sortConfig: vm.sortConfig,
          actionsConfig: {
            actionsInclude: true,
          },
        };
      }

      function filteredOut(item) {
        var filtered = true;
        if (item.info.length + item.warning.length + item.error.length > 0) {
          var filter = _.find(vm.filterConfig.appliedFilters, function(filter) {
            if (! alertsCenterService.matchesFilter(item, filter)) {
              return true;
            }
          });
          filtered = filter != undefined;
        }
        return filtered;
      }

      function sortChange() {
        angular.forEach(vm.groups, function(group) {
          if (group.itemsList) {
            group.itemsList.sort(compareItems);
          }
        });
      }

      function compareItems(item1, item2) {
        var compValue = 0;
        if (vm.toolbarConfig.sortConfig.currentField.id === 'errors') {
          compValue = item1.error.length - item2.error.length;
        } else if (vm.toolbarConfig.sortConfig.currentField.id === 'warnings') {
          compValue = item1.warning.length - item2.warning.length;
        } else if (vm.toolbarConfig.sortConfig.currentField.id === 'infos') {
          compValue = item1.info.length - item2.info.length;
        } else if (vm.toolbarConfig.sortConfig.currentField.id === 'object_name') {
          compValue = item1.name.localeCompare(item2.name);
        } else if (vm.toolbarConfig.sortConfig.currentField.id === 'object_type') {
          compValue = item1.objectType.localeCompare(item2.objectType);
        }

        if (compValue === 0) {
          compValue = item1.name.localeCompare(item2.name);
        }

        if (! vm.toolbarConfig.sortConfig.isAscending) {
          compValue = compValue * -1;
        }

        return compValue;
      }

      vm.toggleGroupOpen = function(section) {
        section.open = ! section.open;
      };

      vm.showGroupAlerts = function(item, status) {
        var locationRef = '/alerts_list/show?name=' + item.name;
        if (status !== undefined) {
          locationRef += '&severity=' + status;
        }
        $window.location.href = locationRef;
      };

      vm.filterChange = function() {
        var totalCount = 0;

        // Clear the existing groups' items
        angular.forEach(vm.groups, function(group) {
          group.itemsList = [];
          group.hasItems = false;
        });

        // Add items to the groups
        angular.forEach(vm.alertData, function(item) {
          if (item.displayType === vm.displayFilter) {
            var group = addGroup(item[vm.category]);
            if (! filteredOut(item)) {
              group.hasItems = true;
              totalCount++;
              group.itemsList.push(item);
            }
          }
        });

        // Sort the groups
        vm.groups.sort(function(group1, group2) {
          if (! group1.value) {
            return 1;
          } else if (! group2.value) {
            return -1;
          }

          return group1.value.localeCompare(group2.value);
        });

        vm.toolbarConfig.filterConfig.resultsCount = totalCount;

        /* Make sure sorting is maintained */
        sortChange();
      };

      function addGroup(category) {
        var foundGroup;
        var groupCategory = category;

        if (category === undefined) {
          foundGroup = vm.unGroupedGroup;
        } else {
          angular.forEach(vm.groups, function(nextGroup) {
            if (nextGroup.value === groupCategory) {
              foundGroup = nextGroup;
            }
          });
        }

        if (! foundGroup) {
          foundGroup = {value: groupCategory, title: groupCategory, itemsList: [], open: true};
          vm.groups.push(foundGroup);
        }

        foundGroup.hasItems = false;

        return foundGroup;
      }

      function processData(response) {
        vm.alertData = alertsCenterService.convertToAlertsOverview(response);

        // Once we have both providers and hosts from different APIs(?) handle this better
        if (alertsCenterService.displayFilters.indexOf(vm.displayFilter) === -1) {
          vm.displayFilter = alertsCenterService.displayFilters[0];
        }

        vm.displayFilters = alertsCenterService.displayFilters;
        vm.categories = alertsCenterService.categories;

        vm.filterChange();
        vm.loadingDone = true;

        $timeout();
      }

      vm.onHoverAlerts = function(alerts) {
        vm.hoverAlerts = alerts;
      };

      vm.processData = processData;

      function initializeAlerts() {
        alertsCenterService.updateAlertsData().then(processData);

        if (alertsCenterService.refreshInterval > 0) {
          $interval(
            function() {
              alertsCenterService.updateAlertsData().then(processData);
            },
            alertsCenterService.refreshInterval
          );
        }
      }

      alertsCenterService.registerObserverCallback(vm.filterChange);
      setupInitialValues();
      initializeAlerts();
    },
  ]);
