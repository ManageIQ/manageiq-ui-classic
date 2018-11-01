/* global patternfly */
angular.module('patternfly.charts').component('pfLineChart', {
  bindings: {
    config: '<',
    chartData: '<',
    showXAxis: '<?',
    showYAxis: '<?',
    setAreaChart: '<?',
  },
  templateUrl: '/static/pf_charts/line-chart.html',
  controller: lineChartController,
});
lineChartController.$inject = ['pfUtils'];

function lineChartController(pfUtils) {
  'use strict';
  var vm = this;
  var prevChartData;

  vm.updateAll = function() {
    // Need to deep watch changes in chart data
    prevChartData = angular.copy(vm.chartData);
    vm.loadingDone = false;
    // Create an ID for the chart based on the chartId in the config if given
    if (vm.lineChartId === undefined) {
      vm.lineChartId = 'lineChart';
      if (vm.config.chartId) {
        vm.lineChartId = vm.config.chartId + vm.lineChartId;
      }
    }

    /*
     * Setup Axis options. Default is to not show either axis. This can be overridden in two ways:
     *   1) in the config, setting showAxis to true will show both axes
     *   2) in the attributes showXAxis and showYAxis will override the config if set
     *
     * By default only line and the tick marks are shown, no labels. This is a line and should be used
     * only to show a brief idea of trending. This can be overridden by setting the config.axis options per C3
     */

    if (vm.showXAxis === undefined) {
      vm.showXAxis = (vm.config.showAxis !== undefined) && vm.config.showAxis;
    }

    if (vm.showYAxis === undefined) {
      vm.showYAxis = (vm.config.showAxis !== undefined) && vm.config.showAxis;
    }

    vm.defaultConfig = patternfly.c3ChartDefaults().getDefaultLineConfig();
    vm.defaultConfig.axis = {
      x: {
        show: vm.showXAxis === true,
        type: 'timeseries',
        tick: {
          format: function() {
            return '';
          },
        },
      },
      y: {
        show: vm.showYAxis === true,
        tick: {
          format: function() {
            return '';
          },
        },
      },
    };

    /*
     * Setup Chart type option. Default is Line Chart.
     */
    if (vm.setAreaChart === undefined) {
      vm.setAreaChart = (vm.config.setAreaChart !== undefined) && vm.config.setAreaChart;
    }

    // Convert the given data to C3 chart format
    vm.config.data = vm.getLineData(vm.chartData);

    // Override defaults with callers specifications
    vm.defaultConfig = pfUtils.merge(vm.defaultConfig, vm.config);

    // Will trigger c3 chart generation
    vm.chartConfig = pfUtils.merge(vm.defaultConfig, vm.config);
  };

  /*
   * Convert the config data to C3 Data
   */
  vm.getLineData = function(chartData) {
    var lineData = {
      type: vm.setAreaChart ? 'area' : 'line',
    };

    if (chartData && chartData.dataAvailable !== false && chartData.xData) {
      lineData.x = chartData.xData[0];
      // Convert the chartData dictionary into a C3 columns data arrays
      lineData.columns = Object.keys(chartData).map(function(key) {
        return chartData[key];
      });
    }

    return lineData;
  };

  vm.$onChanges = function() {
    vm.updateAll();
    vm.loadingDone = true;
  };

  vm.$doCheck = function() {
    // do a deep compare on chartData
    if (! angular.equals(vm.chartData, prevChartData)) {
      vm.updateAll();
    }
  };
}
