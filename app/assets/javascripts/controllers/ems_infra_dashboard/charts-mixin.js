angular.module('miq.util').factory('chartsMixin', ['$document', function($document) {
  'use strict';

  var dailyTimeTooltip = function(data) {
    var theMoment = moment(data[0].x);
    return _.template('<div class="tooltip-inner"><%- col1 %>  <%- col2 %></div>')({
      col1: theMoment.format('MM/DD/YYYY'),
      col2: data[0].value + ' ' + data[0].name,
    });
  };

  var lineChartTooltipPositionFactory = function(chartId) {
    var elementQuery = '#' + chartId + 'lineChart';

    return function(_data, width, height, element) {
      try {
        var center = parseInt(element.getAttribute('x'), 10);
        var top = parseInt(element.getAttribute('y'), 10);
        var chartBox = $document[0].querySelector(elementQuery).getBoundingClientRect();
        var graphOffsetX = $document[0].querySelector(elementQuery + ' g.c3-axis-y').getBoundingClientRect().right;

        var x = Math.max(0, center + graphOffsetX - chartBox.left - Math.floor(width / 2));

        return {
          top: top - height,
          left: Math.min(x, chartBox.width - width),
        };
      } catch (_e) {
        return null;
      }
    };
  };

  var isOpenstack = function isOpenstack(providerType) {
    return (providerType === "ManageIQ::Providers::Openstack::InfraManager");
  };

  var chartConfig = {
    cpuUsageConfig: {
      chartId: 'cpuUsageChart',
      title: __('CPU'),
      units: __('Cores'),
      usageDataName: __('Used'),
      legendLeftText: __('Last 30 Days'),
      legendRightText: '',
      numDays: 30,
    },
    cpuUsageSparklineConfig: {
      tooltipFn: dailyTimeTooltip,
      chartId: 'cpuSparklineChart',
      units: __('Cores'),
    },
    cpuUsageDonutConfig: {
      chartId: 'cpuDonutChart',
      thresholds: { 'warning': '60', 'error': '90' },
    },
    memoryUsageConfig: {
      chartId: 'memUsageChart',
      title: __('Memory'),
      units: __('GB'),
      usageDataName: __('Used'),
      legendLeftText: __('Last 30 Days'),
      legendRightText: '',
      numDays: 30,
    },
    memoryUsageSparklineConfig: {
      tooltipFn: dailyTimeTooltip,
      chartId: 'memorySparklineChart',
      units: __('GB'),
    },
    memoryUsageDonutConfig: {
      chartId: 'memoryDonutChart',
      thresholds: { 'warning': '60', 'error': '90' },
    },
    recentHostsConfig: {
      chartId: 'recentHostsChart',
      tooltip: {
        contents: dailyTimeTooltip,
        position: lineChartTooltipPositionFactory('recentHostsChart'),
      },
      point: {r: 1},
      size: {height: 145},
      grid: {y: {show: false}},
      setAreaChart: true,
    },
    recentVmsConfig: {
      chartId: 'recentVmsChart',
      tooltip: {
        contents: dailyTimeTooltip,
        position: lineChartTooltipPositionFactory('recentVmsChart'),
      },
      point: {r: 1},
      size: {height: 145},
      grid: {y: {show: false}},
      setAreaChart: true,
    },
  };

  var processData = function(data, xDataLabel, yDataLabel) {
    if (! data) {
      return { dataAvailable: false };
    }
    data.xData.unshift(xDataLabel);
    data.yData.unshift(yDataLabel);
    return data;
  };

  return {
    dashboardHeatmapChartHeight: 90,
    nodeHeatMapUsageLegendLabels: ['< 70%', '70-80%', '80-90%', '> 90%'],
    chartConfig: chartConfig,
    processData: processData,
    dailyTimeTooltip: dailyTimeTooltip,
    isOpenstack: isOpenstack,
  };
}]);
