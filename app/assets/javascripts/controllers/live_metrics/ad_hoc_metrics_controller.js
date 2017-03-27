/* global miqHttpInject */
ManageIQ.angular.app.controller('adHocMetricsController', ['$http', '$window', 'miqService',
  'metricsUtilsFactory', 'metricsHttpFactory', 'metricsConfigFactory', 'metricsParseUrlFactory',
  function($http, $window, miqService, metricsUtilsFactory, metricsHttpFactory, metricsConfigFactory, metricsParseUrlFactory) {
    var dash = this;
    var utils = metricsUtilsFactory(dash);
    var httpUtils = metricsHttpFactory(dash, $http, utils, miqService);

    dash.getTenants = httpUtils.getTenants;
    dash.refreshList = httpUtils.refreshList;
    dash.refreshGraph = httpUtils.refreshGraph;
    dash.setFilterOptions = utils.setFilterOptions;
    dash.setPage = httpUtils.setPage;

    var pageSetup = function() {
      // try to parse config variables from page url
      // and set page config variables
      metricsParseUrlFactory(dash, $window);
      metricsConfigFactory(dash);

      // load tenants
      httpUtils.getTenants();
    }

    var initialization = function() {
      dash.tenantChanged = false;
      dash.filterChanged = true;
      dash.itemSelected = false;
      dash.tagsLoaded = false;
      dash.applied = false;
      dash.showGraph = false;

      dash.filtersText = '';
      dash.definitions = [];
      dash.items = [];
      dash.tags = {};
      dash.chartData = {};

      dash.page = 1;
      dash.pages = 1;

      dash.filterConfig = {
        fields: [],
        appliedFilters: [],
        resultsCount: 0,
        onFilterChange: filterChange
      };

      dash.toolbarConfig = {
        filterConfig: dash.filterConfig,
        actionsConfig: dash.actionsConfig
      };

      dash.graphToolbarConfig = {
        actionsConfig: dash.actionsConfig
      };

      var _tenant = dash.tenant.value || dash.DEFAULT_TENANT;
      dash.url = '/container_dashboard/data' + dash.providerId  + '/?live=true&tenant=' + _tenant;

      setAppliedFilters();
    }

    var filterChange = function (filters, addOnly) {
      dash.filterChanged = true;
      dash.filtersText = "";
      dash.tags = {};

      // prevent listing all metrics point
      if (dash.filterConfig.appliedFilters.length === 0) {
        dash.applied = false;
        dash.itemSelected = false;
        dash.tagsLoaded = true;
        dash.items = [];
        dash.page = 1;
        dash.pages = 1;
        dash.filterConfig.resultsCount = 0;
        return;
      }

      dash.filterConfig.appliedFilters.forEach(function (filter) {
        if (filter.title && filter.value) {
          dash.filtersText += filter.title + " : " + filter.value + "\n";
          dash.tags[filter.id] = filter.value;
        }
      });

      // when change filter we automatically apply changes
      if (!addOnly) {
        dash.itemSelected = false;
        dash.items = [];
        dash.page = 1;
        dash.pages = 1;
        dash.filterChanged = false;
        dash.filterConfig.resultsCount = 0;
        dash.applyFilters();
      }
    };

    dash.doAddFilter = function() {
      // if field is empty return
      if ( !dash.filterConfig.currentValue ) return;
      var filter = $('.filter-pf.filter-fields').scope().currentField;

      dash.filterConfig.appliedFilters.push({
        id: filter.id,
        title: filter.title,
        value: dash.filterConfig.currentValue}
      );
      dash.filterConfig.currentValue = "";

      // add a filter but only add (do not apply)
      filterChange(null, true);
    };

    var setAppliedFilters = function() {
      // if user did not send any tags, just exit
      if (!dash.params.tags) return;

      // add the user defined tags as filters
      var tags = JSON.parse(dash.params.tags);
      angular.forEach(tags, function(value, key) {
        dash.filterConfig.appliedFilters.push({
          id: key,
          title: key,
          value: value,
        });
      });

      // apply the new filters
      filterChange();
    }

    dash.applyFilters = function() {
      dash.applied = true;
      dash.filterChanged = false;
      httpUtils.refreshList();
    };

    dash.viewGraph = function() {
      dash.showGraph = true;
      dash.chartDataInit = false;
      httpUtils.refreshGraph();
    };

    dash.viewMetrics = function() {
      dash.showGraph = false;
    };

    dash.refreshTenant = function() {
      initialization();
    };

    // one time initialization of page elemants
    pageSetup();

    // initialize page elemants
    initialization();
  }
]);
