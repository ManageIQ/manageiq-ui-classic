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

  var chartConfig = {
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

  var processData = function(data, xDataLabel, yDataLabel) {
    if (! data) {
      return { dataAvailable: false };
    }
    data.xData.unshift(xDataLabel);
    data.yData.unshift(yDataLabel);
    return data;
  };

  return {
    chartConfig: chartConfig,
    processData: processData,
    dailyTimeTooltip: dailyTimeTooltip
  };
}]);
