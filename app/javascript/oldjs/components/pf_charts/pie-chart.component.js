/* global patternfly */
angular.module('patternfly.charts').component('pfPieChart', {
  bindings: {
    config: '<',
    data: '<',
  },
  templateUrl: '/static/pf_charts/donut-pct-chart.html.haml',
  controller: pieChartController,
});
pieChartController.$inject = ['pfUtils'];

window.pieChartController = function(pfUtils) {
  'use strict';
  var vm = this;
  var prevData;

  vm.pieColumns = function() {
    var columns = [];
    var target = vm.data.columns;
    for (var obj in target) {
      if (target.hasOwnProperty(obj)) {
        columns.push([obj, target[obj]]);
      }
    }

    return columns;
  };

  vm.getPieData = function() {
    var data = {
      type: 'pie',
    };
    data.columns = vm.pieColumns();
    data.colors = vm.config.color;

    return data;
  };

  vm.setChart = function(chart) {
    vm.chart = chart;
  };

  vm.$doCheck = function() {
    // do a deep compare on data
    if (!angular.equals(vm.data, prevData)) {
      vm.updateAll();
    }
  };

  vm.$onInit = function() {
    vm.donutChartId = 'piePctChart';
    if (vm.config.chartId) {
      vm.donutChartId = vm.config.chartId + vm.donutChartId;
    }
    vm.updateAll();
  };

  vm.updateAll = function() {
    // Need to deep watch changes in chart data
    prevData = angular.copy(vm.data);

    var c3ChartDefaults = $().c3ChartDefaults();
    vm.config = pfUtils.merge(c3ChartDefaults.getDefaultPieConfig(), vm.config);
    vm.config.data = vm.getPieData();

    vm.config.legend = {
      show: true,
      position: 'right',
    };
  };
}
