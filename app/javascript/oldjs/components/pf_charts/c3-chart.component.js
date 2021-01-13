angular.module('patternfly.charts').component('pfC3Chart', {
  bindings: {
    config: '<',
    getChartCallback: '<',
  },
  template: '<div id=""></div>',
  controller: c3ChartController,
});
c3ChartController.$inject = ['$timeout', '$attrs'];

window.c3ChartController = function($timeout, $attrs) {
  var vm = this;
  var prevConfig;

  // store the chart object
  var chart;
  vm.generateChart = function() {
    var chartData;

    // Need to deep watch changes in chart config
    prevConfig = angular.copy(vm.config);

    $timeout(function() {
      chartData = vm.config;
      if (chartData) {
        chartData.bindto = '#' + $attrs.id;
        // only re-generate donut pct chart if it has a threshold object
        // because it's colors will change based on data and thresholds
        if (!chart || ($attrs.id.indexOf('donutPctChart') !== -1 && chartData.thresholds)) {
          chart = c3.generate(chartData);
        } else {
          // if chart is already created, then we only need to re-load data
          chart.load(vm.config.data);
        }
        if (vm.getChartCallback) {
          vm.getChartCallback(chart);
        }
        prevConfig = angular.copy(vm.config);
      }
    });
  };

  vm.$doCheck = function() {
    // do a deep compare on config
    if (!angular.equals(vm.config, prevConfig)) {
      vm.generateChart();
    }
  };
}


