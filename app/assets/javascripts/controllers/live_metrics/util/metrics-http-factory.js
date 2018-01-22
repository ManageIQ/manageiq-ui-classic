angular.module('miq.util').factory('metricsHttpFactory', function() {
  return function(dash, $http, utils, miqService) {
    function getMetricTagsData(response) {
      'use strict';
      dash.tagsLoaded = true;

      if (utils.checkResponse(response) === false) {
        return;
      }

      var data = response.data;

      delete dash.filterConfig.fields;
      dash.filterConfig.fields = [];
      if (data && _.isArray(data.metric_tags)) {
        data.metric_tags.sort();

        // remember the metric tags
        dash.metricTags = data.metric_tags;

        // apply dash.metricTags to the filter form
        utils.setFilterOptions();
      }
    }

    function getMetricDefinitionsData(response) {
      'use strict';
      var data = response.data;
      dash.loadingMetrics = false;

      if (utils.checkResponse(response) === false) {
        return;
      }

      dash.items = data.metric_definitions.filter(function(item) {
        var findSelectedItem = dash.selectedItems.find(function(obj) {
          return obj.id === item.id;
        });
        item.selected = typeof findSelectedItem !== 'undefined';

        return item.id && item.type;
      });

      angular.forEach(dash.items, function(item) {
        utils.getContainerDashboardData(item);
      });

      dash.maxPageNumber = data.pages > 0 ? data.pages : 1;
      dash.filterConfig.resultsCount = data.items;

      dash.pageStartIndex = 1 + (dash.pageNumber - 1) * dash.pageSize;
      dash.pageEndIndex = dash.pageStartIndex + dash.items.length - 1;
    }

    function refreshOneGraph(currentItem) {
      var starts = dash.timeFilter.time_range;
      var bucketDuration = dash.bucketDuration;

      // hawkular time is in milisec (hawkular bucketDuration is in seconds)
      var params =
        '&query=get_data&starts=' +
        starts +
        '&bucket_duration=' +
        bucketDuration +
        's';

      // uniqe metric id for prometheus is the sum of all _tags_
      params += '&tags=' + JSON.stringify(currentItem.tags);

      // uniqe metric id for hawkular is the _type_ and _id_ of the metric
      params += '&type=' + currentItem.type + '&metric_id=' + currentItem.id;

      $http
        .get(dash.url + params)
        .then(function(response) {
          utils.getContainerParamsData(currentItem, response);
        })
        .catch(function(error) {
          dash.loadCount++;
          if (dash.loadCount >= dash.selectedItems.length) {
            dash.loadingData = false;
          }
          miqService.handleFailure(error);
        });
    }

    var getMetricTags = function() {
      dash.url =
        '/container_dashboard/data' +
        dash.providerId +
        '/?live=true&tenant=' +
        dash.tenant.value;
      $http
        .get(dash.url + '&query=metric_tags&limit=250')
        .then(getMetricTagsData)
        .catch(function(error) {
          dash.tagsLoaded = true;
          dash.tenantChanged = false;
          miqService.handleFailure(error);
        });
    };

    var getTenants = function() {
      var url =
        '/container_dashboard/data' +
        dash.providerId +
        '/?live=true&query=get_tenants';

      return $http.get(url).then(function(response) {
        if (utils.checkResponse(response) === false) {
          dash.tenantList = [];
          dash.tenant = { value: null };
          dash.tagsLoaded = true;
          return;
        }

        // get db_name
        dash.dbName = response.data.db_name;

        // get the tenant list, and set the current tenant
        dash.tenantList = response.data.tenants;
        dash.tenant = dash.tenantList[0];

        // try to set the current tenant to be the default one
        dash.tenantList.forEach(function callback(obj, i) {
          if (obj.value === dash.DEFAULT_HAWKULAR_TENANT) {
            dash.tenant = dash.tenantList[i];
          }
        });

        // update tag list
        getMetricTags();
      });
    };

    var refreshList = function() {
      dash.loadingMetrics = true;
      var _tags = dash.tags !== {} ? '&tags=' + JSON.stringify(dash.tags) : '';
      var pagination =
        '&page=' + dash.pageNumber + '&items_per_page=' + dash.pageSize;

      $http
        .get(
          dash.url +
            '&limit=' +
            dash.max_metrics +
            '&query=metric_definitions' +
            _tags +
            pagination
        )
        .then(getMetricDefinitionsData)
        .catch(miqService.handleFailure);
    };

    var refreshGraph = function() {
      dash.loadCount = 0;
      dash.loadingData = true;
      dash.chartData = {};

      angular.forEach(dash.selectedItems, function(item, index) {
        item.index = index;
        refreshOneGraph(item);
      });
    };

    var onChangePage = function(event) {
      if (event) {
        dash.pageNumber = event.pageNumber;
      }

      if (dash.pageNumber < 1 || dash.pageNumber > dash.maxPageNumber) {
        dash.pageNumber = 1;
      }

      // make sure we have some filter
      if (dash.filterConfig.appliedFilters.length < 1) {
        return;
      }

      refreshList();
    };

    return {
      getMetricTags: getMetricTags,
      getTenants: getTenants,
      refreshList: refreshList,
      refreshGraph: refreshGraph,
      onChangePage: onChangePage,
    };
  };
});
