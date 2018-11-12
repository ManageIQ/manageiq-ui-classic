angular.module('patternfly.charts').component('pfGroupChart', {
  bindings: {
    chartData: '<',
    config: '<',
    pieConfig: '<',
  },
  templateUrl: '/static/pf_charts/group-chart.html.haml',
  controller: groupChartController,
});

function groupChartController() {
  'use strict';
  var vm = this;
  var prevChartData;
  var prevConfig;

  vm.updateAll = function() {
    // Need to deep watch changes
    prevChartData = angular.copy(vm.chartData);
    prevConfig = angular.copy(vm.config);

    if (vm.config.units !== undefined && vm.pieConfig.units === undefined) {
      vm.pieConfig.units = vm.config.units;
    }
  };

  vm.$onChanges = function() {
    vm.updateAll();
  };

  vm.$doCheck = function() {
    // do a deep compare on chartData and config
    if (!angular.equals(vm.chartData, prevChartData) || !angular.equals(vm.config, prevConfig)) {
      vm.updateAll();
    }
  };
}
