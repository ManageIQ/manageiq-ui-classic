angular.module( 'patternfly.charts' ).component('pfTrendsChart', {
  bindings: {
    config: '<',
    chartData: '<',
    chartHeight: '<?',
    showXAxis: '<?',
    showYAxis: '<?',
  },
  templateUrl: '/static/pf_charts/trends-chart.html.haml',
  controller: trendsChartController,
});
trendsChartController.$inject = [];

function trendsChartController() {
  'use strict';
  var vm = this;
  var prevChartData;
  var prevConfig;
  var SMALL = 30;
  var LARGE = 60;

  vm.updateAll = function() {
    // Need to deep watch changes
    prevChartData = angular.copy(vm.chartData);
    prevConfig = angular.copy(vm.config);
    vm.showLargeCardLayout = (!vm.config.layout || vm.config.layout === 'large');
    vm.showSmallCardLayout = (vm.config.layout === 'small');
    vm.showActualValue = (!vm.config.valueType || vm.config.valueType === 'actual');
    vm.showPercentageValue = (vm.config.valueType === 'percentage');
  };

  vm.getPercentageValue = function() {
    var pctValue = 0;

    if (vm.chartData.dataAvailable !== false && vm.chartData.total > 0) {
      pctValue = Math.round(vm.getLatestValue() / vm.chartData.total * 100.0);
    }
    return pctValue;
  };
  vm.getLatestValue = function() {
    var latestValue = 0;
    if (vm.chartData.yData && vm.chartData.yData.length > 0) {
      latestValue = vm.chartData.yData[vm.chartData.yData.length - 1];
    }
    return latestValue;
  };
  vm.getChartHeight = function() {
    var retValue = LARGE;
    if (vm.chartHeight) {
      retValue = vm.chartHeight;
    } else if (vm.config.layout === 'small') {
      retValue = SMALL;
    }
    return retValue;
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

