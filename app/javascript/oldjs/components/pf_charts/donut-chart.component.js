/* global patternfly */
angular.module('patternfly.charts').component('pfDonutChart', {
  bindings: {
    config: '<',
    data: '<',
    chartHeight: '<?',
  },
  templateUrl: '/static/pf_charts/donut-chart.html.haml',
  controller: donutChartController,
});
donutChartController.$inject = ['pfUtils'];

window.donutChartController = function(pfUtils) {
  'use strict';
  var vm = this;
  var prevData;

  vm.$onInit = function() {
    vm.donutChartId = 'donutChart';
    if (vm.config.chartId) {
      vm.donutChartId = vm.config.chartId + vm.donutChartId;
    }

    vm.updateAll();
  };

  vm.getDonutData = function() {
    return {
      type: 'donut',
      columns: vm.data,
      order: null,
      colors: vm.config.colors,
    };
  };

  vm.updateAll = function() {
    // Need to deep watch changes in chart data
    prevData = angular.copy(vm.data);

    vm.config = pfUtils.merge(patternfly.c3ChartDefaults().getDefaultDonutConfig(), vm.config);
    vm.config.tooltip = { contents: patternfly.pfDonutTooltipContents };
    vm.config.data = vm.getDonutData();
    vm.config.data.onclick = vm.config.onClickFn;
  };

  vm.getTotal = function() {
    var total = 0;
    angular.forEach(vm.data, function(value) {
      angular.forEach(value, function(innerValue) {
        if (!isNaN(innerValue)) {
          total += Number(innerValue);
        }
      });
    });
    return total;
  };

  vm.getCenterLabelText = function() {
    var centerLabelText;

    // default
    centerLabelText = { bigText: vm.getTotal(),
      smText: vm.config.donut.title};

    if (vm.config.centerLabelFn) {
      centerLabelText.bigText = vm.config.centerLabelFn();
      centerLabelText.smText = '';
    }

    return centerLabelText;
  };

  vm.setupDonutChartTitle = function() {
    var donutChartTitle;
    var centerLabelText;

    if (angular.isUndefined(vm.chart)) {
      return;
    }

    donutChartTitle = d3.select(vm.chart.element).select('text.c3-chart-arcs-title');
    if (!donutChartTitle) {
      return;
    }

    centerLabelText = vm.getCenterLabelText();

    // Remove any existing title.
    donutChartTitle.text('');
    if (centerLabelText.bigText && !centerLabelText.smText) {
      donutChartTitle.text(centerLabelText.bigText);
    } else {
      donutChartTitle.insert('tspan').text(centerLabelText.bigText).classed('donut-title-big-pf', true).attr('dy', 0).attr('x', 0);
      donutChartTitle.insert('tspan').text(centerLabelText.smText).classed('donut-title-small-pf', true).attr('dy', 20).attr('x', 0);
    }
  };

  vm.setChart = function(chart) {
    vm.chart = chart;
    vm.setupDonutChartTitle();
  };

  vm.$onChanges = function(changesObj) {
    if (changesObj.config || changesObj.data) {
      vm.updateAll();
    }
    if (changesObj.chartHeight) {
      vm.config.size.height = changesObj.chartHeight.currentValue;
    }
  };

  vm.$doCheck = function() {
    // do a deep compare on data
    if (!angular.equals(vm.data, prevData)) {
      vm.updateAll();
    }
  };
}
