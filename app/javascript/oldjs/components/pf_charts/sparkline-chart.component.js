/* global patternfly */
angular.module('patternfly.charts').component('pfSparklineChart', {
  bindings: {
    config: '<',
    chartData: '<',
    chartHeight: '<?',
    showXAxis: '<?',
    showYAxis: '<?',
  },
  templateUrl: '/static/pf_charts/sparkline-chart.html.haml',
  controller: sparklineChartController,
});
sparklineChartController.$inject = ['pfUtils', '$document'];

window.sparklineChartController = function(pfUtils, $document) {
  'use strict';
  var vm = this;
  var prevChartData;

  vm.updateAll = function() {
    // Need to deep watch changes in chart data
    prevChartData = angular.copy(vm.chartData);

    // Create an ID for the chart based on the chartId in the config if given
    if (vm.sparklineChartId === undefined) {
      vm.sparklineChartId = 'sparklineChart';
      if (vm.config.chartId) {
        vm.sparklineChartId = vm.config.chartId + vm.sparklineChartId;
      }
    }

    /*
     * Setup Axis options. Default is to not show either axis. This can be overridden in two ways:
     *   1) in the config, setting showAxis to true will show both axes
     *   2) in the attributes showXAxis and showYAxis will override the config if set
     *
     * By default only line and the tick marks are shown, no labels. This is a sparkline and should be used
     * only to show a brief idea of trending. This can be overridden by setting the config.axis options per C3
     */

    if (vm.showXAxis === undefined) {
      vm.showXAxis = (vm.config.showAxis !== undefined) && vm.config.showAxis;
    }

    if (vm.showYAxis === undefined) {
      vm.showYAxis = (vm.config.showAxis !== undefined) && vm.config.showAxis;
    }

    vm.defaultConfig = patternfly.c3ChartDefaults().getDefaultSparklineConfig();
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

    // Setup the default configuration
    vm.defaultConfig.tooltip = vm.sparklineTooltip();
    if (vm.chartHeight) {
      vm.defaultConfig.size.height = vm.chartHeight;
    }
    vm.defaultConfig.units = '';

    // Convert the given data to C3 chart format
    vm.config.data = pfUtils.merge(vm.config.data, vm.getSparklineData(vm.chartData));

    // Override defaults with callers specifications
    vm.chartConfig = pfUtils.merge(vm.defaultConfig, vm.config);
  };

  /*
   * Convert the config data to C3 Data
   */
  vm.getSparklineData = function(chartData) {
    var sparklineData  = {
      type: 'area',
    };

    if (chartData && chartData.dataAvailable !== false && chartData.xData && chartData.yData) {
      sparklineData.x = chartData.xData[0];
      sparklineData.columns = [
        chartData.xData,
        chartData.yData,
      ];
    }

    return sparklineData;
  };

  vm.getTooltipTableHTML = function(tipRows) {
    return '<div class="module-triangle-bottom">' +
      '  <table class="c3-tooltip">' +
      '    <tbody>' +
      tipRows +
      '    </tbody>' +
      '  </table>' +
      '</div>';
  };

  vm.sparklineTooltip = function() {
    return {
      contents: function(d) {
        var tipRows;
        var percentUsed = 0;

        if (vm.config.tooltipFn) {
          tipRows = vm.config.tooltipFn(d);
        } else {
          switch (vm.config.tooltipType) {
            case 'usagePerDay':
              if (vm.chartData.dataAvailable !== false && vm.chartData.total > 0) {
                percentUsed = Math.round(d[0].value / vm.chartData.total * 100.0);
              }
              tipRows =
                '<tr>' +
                '  <th colspan="2">' + d[0].x.toLocaleDateString() + '</th>' +
                '</tr>' +
                '<tr>' +
                '  <td class="name">' + percentUsed + '%:' + '</td>' +
                '  <td class="value text-nowrap">' + d[0].value + ' ' +  (vm.config.units ? vm.config.units + ' ' : '') + d[0].name + '</td>' +
                '</tr>';
              break;
            case 'valuePerDay':
              tipRows =
                '<tr>' +
                '  <td class="value">' +  d[0].x.toLocaleDateString() + '</td>' +
                '  <td class="value text-nowrap">' +  d[0].value + ' ' + d[0].name + '</td>' +
                '</tr>';
              break;
            case 'percentage':
              percentUsed = Math.round(d[0].value / vm.chartData.total * 100.0);
              tipRows =
                '<tr>' +
                '  <td class="name">' + percentUsed + '%' + '</td>' +
                '</tr>';
              break;
            default:
              tipRows = patternfly.c3ChartDefaults().getDefaultSparklineTooltip().contents(d);
          }
        }
        return vm.getTooltipTableHTML(tipRows);
      },
      position: function(_data, width, height, element) {
        var center;
        var top;
        var chartBox;
        var graphOffsetX;
        var x;

        try {
          center = parseInt(element.getAttribute('x'), 10);
          top = parseInt(element.getAttribute('y'), 10);
          chartBox = $document[0].querySelector('#' + vm.sparklineChartId).getBoundingClientRect();
          graphOffsetX = $document[0].querySelector('#' + vm.sparklineChartId + ' g.c3-axis-y').getBoundingClientRect().right;
          x = Math.max(0, center + graphOffsetX - chartBox.left - Math.floor(width / 2));

          return {
            top: top - height,
            left: Math.min(x, chartBox.width - width),
          };
        } catch (_e) {
          // empty catch
        }
      },
    };
  };

  vm.$onChanges = function() {
    vm.updateAll();
  };

  vm.$doCheck = function() {
    // do a deep compare on chartData
    if (!angular.equals(vm.chartData, prevChartData)) {
      vm.updateAll();
    }
  };
}
