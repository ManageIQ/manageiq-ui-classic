angular.module('miq.util').factory('metricsHttpFactory', function() {
  return function (dash, $http, utils, miqService) {
    var NUMBER_OF_MILLISEC_IN_HOUR = 60 * 60 * 1000;
    var NUMBER_OF_MILLISEC_IN_SEC = 1000;

    function getLatestData(item) {
      var params = '&query=get_data&type=' + item.type + '&metric_id=' + item.id +
        '&limit=5&order=DESC';

      $http.get(dash.url + params)
        .then(function(response) { utils.getContainerDashboardData(item, response); })
        .catch(miqService.handleFailure);
    };

    function getMetricDefinitionsData(response) {
      'use strict';
      var data = response.data;
      dash.loadingMetrics = false;

      if (utils.checkResponse(response) === false) {
        return;
      }

      dash.items = data.metric_definitions.filter(function(item) {
        return item.id && item.type;
      });

      angular.forEach(dash.items, getLatestData);

      dash.pages = (data.pages > 0) ? data.pages : 1;
      dash.filterConfig.resultsCount = __("Page ") + data.page + __(" Of ") + dash.pages + __(", Found ") + data.items;
    }

    function refreshOneGraph(metricId, metricType, currentItem) {
      var numberOfBucketsInChart = 300;

      var ends = dash.timeFilter.date.valueOf(); // javascript time is in milisec
      var diff = dash.timeFilter.time_range * dash.timeFilter.range_count * NUMBER_OF_MILLISEC_IN_HOUR; // time_range is in hours
      var starts = ends - diff;
      var bucket_duration = parseInt(diff / NUMBER_OF_MILLISEC_IN_SEC / numberOfBucketsInChart); // bucket duration is in seconds

      // make sure bucket duration is not smaller then minBucketDurationInSecondes seconds
      if (bucket_duration < dash.minBucketDurationInSecondes) {
        bucket_duration = dash.minBucketDurationInSecondes;
      }

      // hawkular time is in milisec (hawkular bucket_duration is in seconds)
      var params = '&query=get_data&type=' + metricType + '&metric_id=' + metricId + '&ends=' + ends +
                   '&starts=' + starts + '&bucket_duration=' + bucket_duration + 's';

      $http.get(dash.url + params)
        .then(function(response) {
          utils.getContainerParamsData(metricId, currentItem, response); })
        .catch(function(error) {
          dash.loadCount++;
          if (dash.loadCount >= dash.selectedItems.length) {
            dash.loadingData = false;
          }
          miqService.handleFailure(error); });
    };

    var getMetricTags = function() {
      $http.get(dash.url + '&query=metric_tags&limit=250')
        .then(utils.getMetricTagsData)
        .catch(function(error) {
          dash.tagsLoaded = true;
          dash.tenantChanged = false;
          miqService.handleFailure(error); });
    };

    var getTenants = function() {
      var url = '/container_dashboard/data' + dash.providerId  + '/?live=true&query=get_tenants';

      return $http.get(url).then(function(response) {
        if (utils.checkResponse(response) === false) {
          dash.tenantList = [];
          dash.tenant = {value: null};
          dash.tagsLoaded = true;
          return;
        }

        // get the tenant list, and set the current tenant
        dash.tenantList = response.data.tenants;
        dash.tenant = dash.tenantList[0];

        // try to set the current tenant to be the default one
        dash.tenantList.forEach(function callback(obj, i) {
          if (obj.value === dash.DEFAULT_TENANT) {
            dash.tenant = dash.tenantList[i];
          }
        });

        getMetricTags();
      });
    }

    var refreshList = function() {
      dash.itemSelected = false;
      dash.loadingMetrics = true;
      var _tags = dash.tags !== {} ? '&tags=' + JSON.stringify(dash.tags) : '';
      var pagination = '&page=' + dash.page + '&items_per_page=' + dash.items_per_page;

      $http.get(dash.url + '&limit=' + dash.max_metrics +'&query=metric_definitions' + _tags + pagination)
        .then(getMetricDefinitionsData)
        .catch(miqService.handleFailure);
    };

    var refreshGraph = function() {
      dash.loadCount = 0;
      dash.loadingData = true;

      // TODO: becaouse of a bug in Angular-Patternfly version < v3.21.0 we need this hack
      // it cleans the graph cache, so we can draw new data on a chart that already has some other data.
      // please remove the folowing 2 lines once Angular-Patternfly version is >= v3.21
      var chartScope = $('#ad-hoc-metrics-chartlineChart').scope();
      if (chartScope) chartScope.chartConfig.data.columns = [];

      dash.chartData = {};

      dash.selectedItems = dash.items.filter(function(item) { return item.selected });

      for (var i = 0; i < dash.selectedItems.length; i++) {
        var metric_id = dash.selectedItems[i].id;
        var metric_type = dash.selectedItems[i].type;
        refreshOneGraph(metric_id, metric_type, i);
      }
    };

    var setPage = function(page) {
      var _page = page || 1;
      if (_page < 1) _page = 1;
      if (_page > dash.pages) _page = dash.pages;

      if (dash.page !== _page) {
        dash.page = _page;
        refreshList();
      }
    };

    return {
      getMetricTags: getMetricTags,
      getTenants: getTenants,
      refreshList: refreshList,
      refreshGraph: refreshGraph,
      setPage: setPage
    }
  }
});
