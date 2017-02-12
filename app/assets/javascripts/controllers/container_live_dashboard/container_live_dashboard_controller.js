/* global miqHttpInject */

  ManageIQ.angular.app.controller('containerLiveDashboardController', ['$http', '$window', 'miqService',
    function($http, $window, miqService) {
    var dash = this;
    dash.tenant = '_ops';

    // get the pathname and remove trailing / if exist
    var pathname = $window.location.pathname.replace(/\/$/, '');
    var id = '/' + (/^\/[^\/]+\/(\d+)$/.exec(pathname)[1]);

    var initialization = function() {
      dash.tenantChanged = false;

      dash.filtersText = '';
      dash.definitions = [];
      dash.items = [];
      dash.tags = {};
      dash.tagsLoaded = false;

      dash.applied = false;
      dash.filterChanged = true;
      dash.viewGraph = false;
      dash.chartData = {};

      dash.filterConfig.fields = [];
      dash.filterConfig.resultsCount = dash.items.length;
      dash.filterConfig.appliedFilters = [];
      dash.filterConfig.onFilterChange = filterChange;

      dash.toolbarConfig.filterConfig = dash.filterConfig;
      dash.toolbarConfig.actionsConfig = dash.actionsConfig;

      dash.url = '/container_dashboard/data' + id + '/?live=true&tenant=' + dash.tenant;
    }

    var filterChange = function (filters) {
      dash.filterChanged = true;
      dash.filtersText = "";
      dash.tags = {};
      dash.filterConfig.appliedFilters.forEach(function (filter) {
        dash.filtersText += filter.title + " : " + filter.value + "\n";
        dash.tags[filter.id] = filter.value;
      });
    };

    var selectionChange = function() {
      dash.itemSelected = false;
      for (var i = 0; i < dash.items.length && !dash.itemSelected; i++) {
        if (dash.items[i].selected) {
          dash.itemSelected = true;
        }
      }
    };

    dash.doApply = function() {
      dash.applied = true;
      dash.filterChanged = false;
      dash.refresh();
    };

    dash.doViewGraph = function() {
      dash.viewGraph = true;
      dash.chartDataInit = false;
      dash.refresh_graph_data();
    };

    dash.doViewMetrics = function() {
      dash.viewGraph = false;
      dash.refresh();
    };

    dash.doRefreshTenant = function() {
      initialization();
      getMetricTags();
    };

    var getMetricTags = function() {
      $http.get(dash.url + '&query=metric_tags&limit=250')
        .then(getMetricTagsData)
        .catch(miqService.handleFailure);
    };

    var getLatestData = function(item) {
      var params = '&query=get_data&type=' + item.type + '&metric_id=' + item.id +
        '&limit=5&order=DESC';

      $http.get(dash.url + params)
        .then(function(response) { getContainerDashboardData(item, response); })
        .catch(miqService.handleFailure);
    };

    dash.refresh = function() {
      dash.loadingMetrics = true;
      var _tags = dash.tags !== {} ? '&tags=' + JSON.stringify(dash.tags) : '';
      $http.get(dash.url + '&query=metric_definitions' + _tags)
        .then(getMetricDefinitionsData)
        .catch(miqService.handleFailure);
    };

    dash.refresh_graph = function(metricId, metricType, currentItem) {
      // TODO: replace with a datetimepicker, until then add 24 hours to the date
      dash.metricId = metricId;
      dash.currentItem = currentItem;
      var ends = dash.timeFilter.date.valueOf() + 24 * 60 * 60;
      var diff = dash.timeFilter.time_range * dash.timeFilter.range_count * 60 * 60 * 1000; // time_range is in hours
      var starts = ends - diff;
      var bucket_duration = parseInt(diff / 1000 / 200); // bucket duration is in seconds
      var params = '&query=get_data&type=' + metricType + '&metric_id=' + dash.metricId + '&ends=' + ends +
                   '&starts=' + starts+ '&bucket_duration=' + bucket_duration + 's';

      $http.get(dash.url + params)
        .then(getContainerParamsData)
        .catch(miqService.handleFailure);
    };

    dash.refresh_graph_data = function() {
      dash.loadCount = 0;
      dash.loadingData = true;
      dash.chartData = {};

      dash.selectedItems = dash.items.filter(function(item) { return item.selected });

      for (var i = 0; i < dash.selectedItems.length; i++) {
        var metric_id = dash.selectedItems[i].id;
        var metric_type = dash.selectedItems[i].type;
        dash.refresh_graph(metric_id, metric_type, i);
      }
    };

    dash.getTenants = function(include) {
      return $http.get(dash.url + "&query=get_tenants&limit=7&include=" + include).then(function(response) {
        return response.data.tenants;
      });
    }

    dash.timeRanges = [
      {title: _("Hours"), value: 1},
      {title: _("Days"), value: 24},
      {title: _("Weeks"), value: 168},
      {title: _("Months"), value: 672}
    ];

    dash.timeFilter = {
      time_range: 24,
      range_count: 1,
      date: moment()
    };

    dash.dateOptions = {
      format: __('MM/DD/YYYY HH:mm')
    };

    dash.countDecrement = function() {
      if (dash.timeFilter.range_count > 1) {
        dash.timeFilter.range_count--;
      }
    };

    dash.countIncrement = function() {
      dash.timeFilter.range_count++;
    };

    // Graphs
    dash.chartConfig = {
      legend       : { show: false },
      chartId      : 'adHocMetricsChart',
      point        : { r: 1 },
      axis         : {
        x: {
          tick: {
            count: 25,
            format: function (value) { return moment(value).format(__('MM/DD/YYYY HH:mm')); }
          }},
        y: {
          tick: {
            count: 4,
            format: function (value) { return numeral(value).format('0,0.00a'); }
          }}
      },
      setAreaChart : true,
      subchart: {
        show: true
      }
    };

    dash.actionsConfig = {
      actionsInclude: true
    };

    dash.graphToolbarConfig = {
      actionsConfig: dash.actionsConfig
    };

    dash.itemSelected = false;

    dash.listConfig = {
      selectionMatchProp: 'id',
      showSelectBox: true,
      useExpandingRows: true,
      onCheckBoxChange: selectionChange
    };

    dash.filterConfig = {};
    dash.toolbarConfig = {};

    initialization();
    getMetricTags();

    function getMetricTagsData(response) {
      var data = response.data;

      dash.tagsLoaded = true;
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
        dash.toolbarConfig.filterConfig = undefined;
        dash.doApply();
      }
    }

    function getContainerDashboardData(item, response) {
      'use strict';
      if (response.data.error) {
        add_flash(response.data.error, 'error');
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

    function getMetricDefinitionsData(response) {
      'use strict';

      var data = response.data;

      dash.loadingMetrics = false;
      if (response.data.error) {
        add_flash(response.data.error, 'error');
        return;
      }

      dash.items = data.metric_definitions.filter(function(item) {
        return item.id && item.type;
      });

      angular.forEach(dash.items, getLatestData);

      dash.filterConfig.resultsCount = dash.items.length;
    }

    function getContainerParamsData(response) {
      'use strict';

      if (response.data.error) {
        add_flash(response.data.error, 'error');
        return;
      }

      var data  = response.data.data;
      var xData = data.map(function(d) { return d.start; });
      var yData = data.map(function(d) { return d.avg || null; });

      xData.unshift('time');
      yData.unshift(dash.metricId);

      // TODO: Use time buckets
      dash.chartData.xData = xData;
      dash.chartData['yData'+ dash.currentItem] = yData;

      dash.chartDataInit = true;
      dash.loadCount++;
      if (dash.loadCount >= dash.selectedItems.length) {
        dash.loadingData = false;
      }
    }
    }]);
