angular.module('miq.util').factory('metricsUtilsFactory', function() {
  return function (dash) {
    var UNKNOWN_ERROR_STR = __('Something is wrong, try reloading the page');

    var checkResponse = function(response) {
      if (response.error || response.data.error || typeof response.data === 'string') {
        add_flash(response.error || response.data.error || UNKNOWN_ERROR_STR, 'error');
        return false;
      }

      return true;
    }

    var setFilterOptionsAlpha = function(tagsData) {
      for (var i = 0; i < tagsData.length; i++) {
        var tagItem = tagsData[i];

        dash.filterConfig.fields.push(
          {
            id: tagItem.tag,
            title: tagItem.tag,
            placeholder: sprintf(__('Filter by %s...'), tagItem.tag),
            filterType: 'alpha'
          });
      }
    }

    var setFilterOptionsSelect = function(tagsData) {
      for (var i = 0; i < tagsData.length; i++) {
        var tagItem = tagsData[i];

        dash.filterConfig.fields.push(
          {
            id: tagItem.tag,
            title: tagItem.tag,
            placeholder: sprintf(__('Filter by %s...'), tagItem.tag),
            filterType: 'select',
            filterValues: tagItem.options
          });
      }
    }

    var setFilterOptions = function() {
      dash.filterConfig.fields = [];

      if (dash.filterType === 'simple') {
        setFilterOptionsSelect(dash.metricTags);
      } else {
        setFilterOptionsAlpha(dash.metricTags);
      }
    }

    var getMetricTagsData = function(response) {
      'use strict';
      dash.tagsLoaded = true;

      if (checkResponse(response) === false) {
        return;
      }

      var data = response.data;

      dash.filterConfig.fields = [];
      if (data && angular.isArray(data.metric_tags)) {
        data.metric_tags.sort();

        // remember the metric tags
        dash.metricTags = data.metric_tags;

        // apply dash.metricTags to the filter form
        setFilterOptions();
      }
    }

    var getContainerParamsData = function(metricId, currentItem, response) {
      'use strict';
      dash.loadCount++;
      if (dash.loadCount >= dash.selectedItems.length) {
        dash.loadingData = false;
      }

      if (checkResponse(response) === false) {
        return;
      }

      var data  = response.data.data;
      var xData = data.map(function(d) { return d.start; });
      var yData = data.map(function(d) { return d.avg || null; });

      xData.unshift('time');
      yData.unshift(metricId);

      dash.chartData.xData = xData;
      dash.chartData['yData'+ currentItem] = yData;

      dash.chartDataInit = true;
    }

    var getContainerDashboardData = function(item, response) {
      'use strict';
      if (checkResponse(response) === false) {
        return;
      }

      var data = response.data.data.sort(function(a, b) { return a.timestamp < b.timestamp; });

      item.lastValues = {};
      angular.forEach(data, function(d) {
        item.lastValues[d.timestamp] = numeral(d.value).format('0,0.00a');
      });

      if (data.length > 0) {
        var lastValue = data[0].value;
        item.last_value = numeral(lastValue).format('0,0.00a');
        item.last_timestamp = data[0].timestamp;
      } else {
        item.last_value = '-';
        item.last_timestamp = '-';
      }

      if (data.length > 1) {
        var prevValue = data[1].value;
        if (angular.isNumber(lastValue) && angular.isNumber(prevValue)) {
          var change;
          if (prevValue !== 0 && lastValue !== 0) {
            change = Math.round((lastValue - prevValue) / lastValue);
          } else if (lastValue !== 0) {
            change = 1;
          } else {
            change = 0;
          }
          item.percent_change = '(' + numeral(change).format('0,0.00%') + ')';
        }
      }
    }

    return {
      getMetricTagsData: getMetricTagsData,
      getContainerParamsData: getContainerParamsData,
      getContainerDashboardData: getContainerDashboardData,
      checkResponse: checkResponse,
      setFilterOptions: setFilterOptions
    }
  }
});
