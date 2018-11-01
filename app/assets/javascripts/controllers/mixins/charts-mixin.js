angular.module('miq.util').factory('chartsMixin', ['$document', 'pfUtils', function($document, pfUtils) {
  'use strict';

  var dailyTimeTooltip = function(data) {
    var theMoment = moment(data[0].x);
    return _.template('<div class="tooltip-inner"><%- col1 %>  <%- col2 %></div>')({
      col1: theMoment.format('MM/DD/YYYY'),
      col2: data[0].value + ' ' + data[0].name,
    });
  };

  var dailyPodTimeTooltip = function(data) {
    var theMoment = moment(data[0].x);
    return _.template('<div class="tooltip-inner"><%- col1 %></br>  <%- col2 %></div>')({
      col1: theMoment.format('MM/DD/YYYY'),
      col2: data[0].value + ' ' + data[0].name + ', ' + data[1].value + ' ' + data[1].name,
    });
  };

  var hourlyPodTimeTooltip = function(data) {
    var theMoment = moment(data[0].x);
    return _.template('<div class="tooltip-inner"><%- col1 %>: <%- col2 %></div>')({
      col1: theMoment.format('h:mm A'),
      col2: data[0].value + ' ' + data[0].name + ', ' + data[1].value + ' ' + data[1].name,
    });
  };

  var hourlyTimeTooltip = function(data) {
    var theMoment = moment(data[0].x);
    return _.template('<div class="tooltip-inner"><%- col1 %>: <%- col2 %></div>')({
      col1: theMoment.format('h:mm A'),
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
    recentResourcesConfig: {
      chartId: 'recentResourcesChart',
      tooltip: {
        contents: dailyTimeTooltip,
        position: lineChartTooltipPositionFactory,
      },
      point: {r: 1},
      size: {height: 145},
      grid: {y: {show: false}},
      setAreaChart: true,
    },
    recentVmsConfig: {
      chartId: 'recentVmsChart',
      headTitle: __('Recent VMs'),
      label: __('VMs'),
      tooltip: {
        contents: dailyTimeTooltip,
        position: lineChartTooltipPositionFactory('recentVmsChart'),
      },
      point: {r: 1},
      size: {height: 145},
      grid: {y: {show: false}},
      setAreaChart: true,
    },
    dailyNetworkUsageConfig: {
      chartId: 'networkUsageDailyChart',
      headTitle: __('Network Utilization Trend'),
      timeFrame: __('Last 30 Days'),
      units: __('KBps'),
      dataName: __('KBps'),
      tooltipFn: dailyTimeTooltip,
    },
    hourlyNetworkUsageConfig: {
      chartId: 'networkUsageHourlyChart',
      headTitle: __('Network Utilization Trend'),
      timeFrame: __('Last 24 Hours'),
      units: __('KBps'),
      dataName: __('KBps'),
      tooltipFn: hourlyTimeTooltip,
    },
    dailyPodUsageConfig: {
      chartId: 'podUsageDailyChart',
      headTitle: __('Pod Creation and Deletion Trends'),
      timeFrame: __('Last 30 days'),
      createdLabel: __('Created'),
      deletedLabel: __('Deleted'),
      tooltip: {
        contents: dailyPodTimeTooltip,
        position: lineChartTooltipPositionFactory('podUsageDailyChart'),
      },
      point: {r: 1},
      size: {height: 145},
      color: {pattern: [pfUtils.colorPalette.blue, pfUtils.colorPalette.green]},
      grid: {y: {show: false}},
      setAreaChart: true,
    },
    hourlyPodUsageConfig: {
      chartId: 'podUsageHourlyChart',
      headTitle: __('Pod Creation and Deletion Trends'),
      timeFrame: __('Last 24 hours'),
      createdLabel: __('Created'),
      deletedLabel: __('Deleted'),
      tooltip: {
        contents: hourlyPodTimeTooltip,
        position: lineChartTooltipPositionFactory('podUsageHourlyChart'),
      },
      point: {r: 1},
      size: {height: 145},
      color: {pattern: [pfUtils.colorPalette.blue, pfUtils.colorPalette.green]},
      grid: {y: {show: false}},
      setAreaChart: true,
    },
    dailyImageUsageConfig: {
      chartId: 'imageUsageDailyChart',
      headTitle: __('New Image Usage Trend'),
      timeFrame: __('Last 30 days'),
      createdLabel: __('Images'),
      tooltip: {
        contents: dailyTimeTooltip,
        position: lineChartTooltipPositionFactory('imageUsageDailyChart'),
      },
      point: {r: 1},
      size: {height: 93},
      grid: {y: {show: false}},
      setAreaChart: true,
    },
    hourlyImageUsageConfig: {
      chartId: 'imageUsageHourlyChart',
      headTitle: __('New Image Usage Trend'),
      timeFrame: __('Last 24 hours'),
      createdLabel: __('Images'),
      tooltip: {
        contents: hourlyTimeTooltip,
        position: lineChartTooltipPositionFactory('imageUsageHourlyChart'),
      },
      point: {r: 1},
      size: {height: 93},
      grid: {y: {show: false}},
      setAreaChart: true,
    },
    availableServersUsageConfig: {
      chartId: 'serverAvailabilityChart',
      title: __('Servers Available'),
      units: __('Server'),
      usageDataName: __('Used'),
      legendLeftText: __('Last 30 Days'),
      legendRightText: '',
      numDays: 30,
    },
    availableServersUsagePieConfig: {
      chartId: 'serverAvailablePieChart_',
    },
    serversHealthUsageConfig: {
      chartId: 'serverHealthChart',
      title: __('Servers Health'),
      units: __('Server'),
      usageDataName: __('Used'),
      legendLeftText: __('Last 30 Days'),
      legendRightText: '',
      numDays: 30,
    },
    serversHealthUsagePieConfig: {
      chartId: 'serverHealthPieChart_',
      color: {
        valid: $.pfPaletteColors.green,
        warning: $.pfPaletteColors.orange,
        critical: $.pfPaletteColors.red,
      },
    },
    recentServersConfig: {
      chartId: 'recentServersChart',
      tooltip: {
        contents: dailyTimeTooltip,
        position: lineChartTooltipPositionFactory('recentServersChart'),
      },
      point: {r: 1},
      size: {height: 145},
      grid: {y: {show: false}},
      setAreaChart: true,
    },
  };

  var parseDate = function(date) {
    var myDate = Date.parse(date);
    return isNaN(myDate) ? date : myDate;
  };

  var processData = function(data, xDataLabel, yDataLabel) {
    if (! data) {
      return { dataAvailable: false };
    }
    data.xData.unshift(xDataLabel);
    if (data.yData !== undefined) {data.yData.unshift(yDataLabel);}
    return data;
  };

  var processPodUtilizationData = function(data, xDataLabel, yCreatedLabel, yDeletedLabel) {
    if (! data) {
      return { dataAvailable: false };
    }

    data.xData.unshift(xDataLabel);
    data.yCreated.unshift(yCreatedLabel);
    data.yDeleted.unshift(yDeletedLabel);
    return data;
  };

  return {
    dashboardHeatmapChartHeight: 90,
    nodeHeatMapUsageLegendLabels: ['< 70%', '70-80%', '80-90%', '> 90%'],
    chartConfig: chartConfig,
    parseDate: parseDate,
    processPodUtilizationData: processPodUtilizationData,
    processData: processData,
    dailyTimeTooltip: dailyTimeTooltip,
    hourlyTimeTooltip: hourlyTimeTooltip,
  };
}]);
