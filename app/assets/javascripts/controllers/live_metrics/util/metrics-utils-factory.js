angular.module('miq.util').factory('metricsUtilsFactory', function() {
  return function(dash, $timeout) {
    var UNKNOWN_ERROR_STR = __('Something is wrong, try reloading the page');

    function calcDataDifferentials(data) {
      var outData = [];

      data.forEach(function(value, i) {
        if ((value !== null) && (data[i + 1] !== null) && (typeof data[i + 1] !== 'undefined')) {
          outData[i] = data[i + 1] - value;
        } else {
          outData[i] = null;
        }
      });

      return outData;
    }

    var checkResponse = function(response) {
      if (response.error || response.data.error || typeof response.data === 'string') {
        add_flash(response.error || response.data.error || UNKNOWN_ERROR_STR, 'error');
        return false;
      }

      return true;
    };

    var setFilterOptionsAlpha = function(tagsData) {
      for (var i = 0; i < tagsData.length; i++) {
        var tagItem = tagsData[i];

        dash.filterConfig.fields.push(
          {
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

        dash.filterConfig.fields.push(
          {
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

      if (dash.filterType === 'simple') {
        setFilterOptionsSelect(dash.metricTags);
      } else {
        setFilterOptionsAlpha(dash.metricTags);
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

      currentItem.responseData  = response.data.data.slice();
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
      var xData = currentItem.responseData.map(function(d) { return d.start; });
      var yData = currentItem.responseData.map(function(d) { return d.avg || null; });

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
      return '<div class="tooltip-inner">' +
        moment(data[0].x).format('MM/DD hh:mm') + ' : ' +
        data[0].value.toFixed(2) + '</div>';
    };

    var metricPrefix = function(maxValue, units) {
      var metricPrefixes;
      var baseUnit;
      var baseUnitMultiplier;
      var baseUnitMaxValue;
      var exp;

      // get base unit for special case units
      switch (units) {
        case 'millisecond':
        case 'ms':
          baseUnitMultiplier = Math.pow(10, -3);
          baseUnit = 's';
          break;
        case 'ns':
          baseUnitMultiplier = Math.pow(10, -9);
          baseUnit = 's';
          break;
        default:
          baseUnitMultiplier = 1;
          baseUnit = units;
      }

      // adjust to base units and calc exponent
      baseUnitMaxValue = maxValue * baseUnitMultiplier;
      exp = ~~(Math.log10(baseUnitMaxValue) / 3) * 3;

      // calc output unit label and multiplier
      metricPrefixes = {
        3: {unitLabel: 'K' + baseUnit, multiplier: baseUnitMultiplier * Math.pow(10, -3)},
        6: {unitLabel: 'M' + baseUnit, multiplier: baseUnitMultiplier * Math.pow(10, -6)},
        9: {unitLabel: 'G' + baseUnit, multiplier: baseUnitMultiplier * Math.pow(10, -9)},
        12: {unitLabel: 'T' + baseUnit, multiplier: baseUnitMultiplier * Math.pow(10, -12)},
        15: {unitLabel: 'P' + baseUnit, multiplier: baseUnitMultiplier * Math.pow(10, -15)},
      };

      return metricPrefixes[exp] || {unitLabel: baseUnit, multiplier: baseUnitMultiplier};
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

      item.data = item.data.sort(function(a, b) { return a.timestamp > b.timestamp; });
      var maxValue = Math.max.apply(Math, item.data.map(function(o) { return o.value; }));
      var m = metricPrefix(maxValue, item.tags.units || '');

      var id = _.uniqueId('ChartId_');
      var label = item.tags.descriptor_name || item.id;
      var units = m.unitLabel;

      item.lastValues = {
        total: '100',
        xData: ['dates'],
        yData: [units],
      };
      angular.forEach(item.data, function(d) {
        item.lastValues.xData.push(new Date(d.timestamp));
        item.lastValues.yData.push((d.value * m.multiplier).toFixed(2));
      });
      item.lastValue = '' + item.lastValues.yData[item.data.length] + ' ' + units;

      item.configTrend = {
        chartId: id,
        title: label,
        layout: 'compact',
        valueType: 'actual',
        units: units,
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
      metricPrefix: metricPrefix,
    };
  };
});
