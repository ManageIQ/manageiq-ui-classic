angular.module('patternfly.charts').component('pfUtilizationTrendChart', {
  bindings: {
    chartData: '<',
    config: '<',
    centerLabel: '<?',
    donutConfig: '<',
    sparklineConfig: '<',
    sparklineChartHeight: '<?',
    showSparklineXAxis: '<?',
    showSparklineYAxis: '<?',
  },
  templateUrl: '/static/pf_charts/utilization-trend-chart.html.haml',
  controller: utilizationTrendChartController,
});
utilizationTrendChartController.$inject = ['pfUtils'];

function utilizationTrendChartController() {
  'use strict';
  var vm = this;
  var prevChartData;
  var prevConfig;

  vm.updateAll = function() {
    // Need to deep watch changes
    prevChartData = angular.copy(vm.chartData);
    prevConfig = angular.copy(vm.config);

    if (vm.centerLabel === undefined) {
      vm.centerLabel = 'used';
    }

    if (vm.config.units !== undefined && vm.donutConfig.units === undefined) {
      vm.donutConfig.units = vm.config.units;
    }

    if (vm.chartData.available === undefined) {
      vm.chartData.available = vm.chartData.total - vm.chartData.used;
    }

    vm.config.units = vm.config.units || vm.units;

    if (vm.centerLabel === 'available') {
      vm.currentValue = vm.chartData.used;
      vm.currentText = __('Used');
    } else {
      vm.currentValue = vm.chartData.total - vm.chartData.used;
      vm.currentText = __('Available');
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

