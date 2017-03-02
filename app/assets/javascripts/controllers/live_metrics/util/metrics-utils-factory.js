angular.module('miq.util').factory('metricsUtilsFactory', function() {
  return function (dash) {
    var getMetricTagsData = function(response) {
      'use strict';
      dash.tagsLoaded = true;
      if (response.error || response.data.error) {
        add_flash(response.error || response.data.error, 'error');
        return;
      }

      var data = response.data;

      if (data && angular.isArray(data.metric_tags)) {
        data.metric_tags.sort();
        for (var i = 0; i < data.metric_tags.length; i++) {
          dash.filterConfig.fields.push(
            {
              id: data.metric_tags[i],
              title: data.metric_tags[i],
              placeholder: sprintf(__('Filter by %s...'), data.metric_tags[i]),
              filterType: 'alpha',
            });
        }
      } else {
        // No filters available, apply without filtering
        dash.filterConfig.fields = [];
      }
    }

    var getContainerParamsData = function(metricId, currentItem, response) {
      'use strict';
      dash.loadCount++;
      if (dash.loadCount >= dash.selectedItems.length) {
        dash.loadingData = false;
      }

      if (response.error || response.data.error) {
        add_flash(response.error || response.data.error, 'error');
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
      if (response.error || response.data.error) {
        add_flash(response.error || response.data.error, 'error');
      } else {
        var data = response.data.data;

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
    }

    return {
      getMetricTagsData: getMetricTagsData,
      getContainerParamsData: getContainerParamsData,
      getContainerDashboardData: getContainerDashboardData
    }
  }
});
