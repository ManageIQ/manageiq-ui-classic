/* global patternfly */
angular.module('patternfly.charts').component('pfDonutPctChart', {
  bindings: {
    config: '<',
    data: '<',
    chartHeight: '<?',
    centerLabel: '<?',
    onThresholdChange: '&',
  },
  templateUrl: '/static/pf_charts/donut-pct-chart.html.haml',
  controller: donutPctChartController,
});
donutPctChartController.$inject = ['pfUtils'];

function donutPctChartController(pfUtils) {
  'use strict';
  var vm = this;
  var prevData;

  vm.$onInit = function() {
    vm.donutChartId = 'donutPctChart';
    if (vm.config.chartId) {
      vm.donutChartId = vm.config.chartId + vm.donutChartId;
    }

    vm.updateAll();
  };

  vm.updateAvailable = function() {
    vm.data.available = vm.data.total - vm.data.used;
  };

  vm.getStatusColor = function(used, thresholds) {
    var threshold = 'none';
    var color = pfUtils.colorPalette.blue;

    if (thresholds) {
      threshold = 'ok';
      color = pfUtils.colorPalette.green;
      if (used >= thresholds.error) {
        threshold = 'error';
        color = pfUtils.colorPalette.red;
      } else if (used >= thresholds.warning) {
        threshold = 'warning';
        color = pfUtils.colorPalette.orange;
      }
    }

    if (! vm.threshold || vm.threshold !== threshold) {
      vm.threshold = threshold;
      vm.onThresholdChange({ threshold: vm.threshold });
    }

    return color;
  };

  vm.statusDonutColor = function() {
    var color;
    var percentUsed;

    color = { pattern: [] };
    percentUsed = vm.data.used / vm.data.total * 100.0;
    color.pattern[0] = vm.getStatusColor(percentUsed, vm.config.thresholds);
    color.pattern[1] = pfUtils.colorPalette.black300;
    return color;
  };

  vm.donutTooltip = function() {
    return {
      contents: function(d) {
        var tooltipHtml;

        if (vm.config.tooltipFn) {
          tooltipHtml = '<span class="donut-tooltip-pf" style="white-space: nowrap;">' +
            vm.config.tooltipFn(d) +
            '</span>';
        } else {
          tooltipHtml = '<span class="donut-tooltip-pf" style="white-space: nowrap;">' +
            Math.round(d[0].ratio * 100) + '%' + ' ' + vm.config.units + ' ' + d[0].name +
            '</span>';
        }

        return tooltipHtml;
      },
    };
  };

  vm.getDonutData = function() {
    return {
      columns: [
        [__('Used'), vm.data.used],
        [__('Available'), vm.data.available],
      ],
      type: 'donut',
      donut: {
        label: {
          show: false,
        },
      },
      groups: [
        ['used', 'available'],
      ],
      order: null,
    };
  };

  vm.getCenterLabelText = function() {
    var centerLabelText;

    // default to 'used' info.
    centerLabelText = { bigText: vm.data.used,
      smText: vm.config.units + __(' Used') };

    if (vm.config.centerLabelFn) {
      centerLabelText.bigText = vm.config.centerLabelFn();
      centerLabelText.smText = '';
    } else if (vm.centerLabel === 'none') {
      centerLabelText.bigText = '';
      centerLabelText.smText = '';
    } else if (vm.centerLabel === 'available') {
      centerLabelText.bigText = vm.data.available;
      centerLabelText.smText = vm.config.units + __(' Available');
    } else if (vm.centerLabel === 'percent') {
      centerLabelText.bigText = Math.round(vm.data.used / vm.data.total * 100.0) + '%';
      centerLabelText.smText = __('of ') + vm.data.total + ' ' + vm.config.units;
    }

    return centerLabelText;
  };

  vm.updateAll = function() {
    // Need to deep watch changes in chart data
    prevData = angular.copy(vm.data);

    vm.config = pfUtils.merge(patternfly.c3ChartDefaults().getDefaultDonutConfig(), vm.config);
    vm.updateAvailable();
    vm.config.data = pfUtils.merge(vm.config.data, vm.getDonutData());
    vm.config.color = vm.statusDonutColor(vm);
    vm.config.tooltip = vm.donutTooltip();
    vm.config.data.onclick = vm.config.onClickFn;
  };

  vm.setupDonutChartTitle = function() {
    var donutChartTitle;
    var centerLabelText;

    if (angular.isUndefined(vm.chart)) {
      return;
    }

    donutChartTitle = d3.select(vm.chart.element).select('text.c3-chart-arcs-title');
    if (! donutChartTitle) {
      return;
    }

    centerLabelText = vm.getCenterLabelText();

    // Remove any existing title.
    donutChartTitle.selectAll('*').remove();
    if (centerLabelText.bigText && ! centerLabelText.smText) {
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
    if (changesObj.centerLabel) {
      vm.setupDonutChartTitle();
    }
  };

  vm.$doCheck = function() {
    // do a deep compare on data
    if (! angular.equals(vm.data, prevData)) {
      vm.updateAll();
    }
  };
}
