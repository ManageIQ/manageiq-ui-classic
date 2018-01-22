/** global: _ */

angular.module('miq.util').factory('metricsUtilsFactory', function() {
  return function(dash, $timeout) {
    var UNKNOWN_ERROR_STR = __('Something is wrong, try reloading the page');

    function calcDataDifferentials(data) {
      var outData = [];

      data.forEach(function(value, i) {
        if (
          value !== null &&
          data[i + 1] !== null &&
          typeof data[i + 1] !== 'undefined'
        ) {
          outData[i] = data[i + 1] - value;
        } else {
          outData[i] = null;
        }
      });

      return outData;
    }

    var checkResponse = function(response) {
      if (
        response.error ||
        response.data.error ||
        typeof response.data === 'string'
      ) {
        add_flash(
          response.error || response.data.error || UNKNOWN_ERROR_STR,
          'error'
        );
        return false;
      }

      return true;
    };

    var setFilterOptionsAlpha = function(tagsData) {
      for (var i = 0; i < tagsData.length; i++) {
        var tagItem = tagsData[i];

        dash.filterConfig.fields.push({
          id: tagItem.tag,
          title: tagItem.tag,
          placeholder: sprintf(__('Filter by %s...'), tagItem.tag),
          filterType: 'alpha',
        });
      }
    };

    var setFilterOptionsSelect = function(tagsData) {
      for (var i = 0; i < tagsData.length; i++) {
        var tagItem = tagsData[i];

        dash.filterConfig.fields.push({
          id: tagItem.tag,
          title: tagItem.tag,
          placeholder: sprintf(__('Filter by %s...'), tagItem.tag),
          filterType: 'select',
          filterValues: tagItem.options,
        });
      }
    };

    var setFilterOptions = function() {
      dash.filterConfig.fields = [];

      if (dash.showRegexp) {
        setFilterOptionsAlpha(dash.metricTags);
      } else {
        setFilterOptionsSelect(dash.metricTags);
      }
    };

    var getContainerParamsData = function(currentItem, response) {
      'use strict';
      dash.loadCount++;
      if (dash.loadCount >= dash.selectedItems.length) {
        dash.loadingData = false;
      }

      if (checkResponse(response) === false) {
        return;
      }

      currentItem.responseData = response.data.data.slice();
      drawOneGraph(currentItem);
    };

    function redrawGraph() {
      $timeout(function() {
        angular.forEach(dash.selectedItems, drawOneGraph);
      }, 10);
    }

    function drawOneGraph(currentItem) {
      var switchObj = angular.element('#rate-switch');
      var showRate = switchObj.bootstrapSwitch('state');
      var xData = currentItem.responseData.map(function(d) {
        return d.start;
      });
      var yData = currentItem.responseData.map(function(d) {
        return d.avg || null;
      });

      // if diff checkbox is on, do diff
      if (showRate) {
        yData = calcDataDifferentials(yData);
      }

      xData.unshift('time');
      yData.unshift(currentItem.id);

      dash.chartData.xData = xData;
      dash.chartData['yData' + currentItem.index] = yData;

      dash.chartDataInit = true;
    }

    var timeTooltip = function(data) {
      return (
        '<div class="tooltip-inner">' +
        moment(data[0].x).format('MM/DD hh:mm') +
        ' : ' +
        data[0].value.toFixed(2) +
        '</div>'
      );
    };

    var getContainerDashboardData = function(item) {
      'use strict';
      // it no data return gracefully
      if (! item.data) {
        return;
      }

      // make sure we have tags
      if (! item.tags) {
        item.tags = {};
      }

      item.data = item.data.sort(function(a, b) {
        return a.timestamp > b.timestamp;
      });
      var id = _.uniqueId('ChartId_');
      var label = item.tags.descriptor_name || item.tags.__name__ || item.id;

      item.lastValues = {
        total: '100',
        xData: ['dates'],
        yData: ['data'],
      };
      angular.forEach(item.data, function(d) {
        item.lastValues.xData.push(new Date(d.timestamp));
        item.lastValues.yData.push(Number.parseFloat(d.value).toFixed(2));
      });
      item.lastValue = numeral(item.lastValues.yData[item.data.length]).format(
        '0.0a'
      );

      item.configTrend = {
        chartId: id,
        title: label,
        valueType: 'actual',
        tooltipFn: timeTooltip,
      };
    };

    return {
      getContainerParamsData: getContainerParamsData,
      getContainerDashboardData: getContainerDashboardData,
      checkResponse: checkResponse,
      setFilterOptions: setFilterOptions,
      calcDataDifferentials: calcDataDifferentials,
      redrawGraph: redrawGraph,
    };
  };
});
