angular.module('miq.util').factory('metricsConfigFactory', function() {
  return function(dash) {
    function selectionChange(item) {
      if (item.selected) {
        dash.selectedItems.push(item);
      } else {
        dash.selectedItems = dash.selectedItems.filter(function( obj ) { return obj.id !== item.id; });
      }

      dash.itemSelected = dash.selectedItems.length > 0;
    }

    dash.DEFAULT_HAWKULAR_TENANT = '_system';
    dash.DEFAULT_PROMETHEUS_TENANT = 'kubernetes-cadvisor';
    dash.tenant = {value: null};

    dash.actionsConfig = {
      actionsInclude: true,
    };

    dash.timeFilter = {
      time_range: 24,
      range_count: 1,
      date: moment(),
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
      legend: { show: true },
      chartId: 'ad-hoc-metrics-chart',
      point: { r: 1 },
      axis: {
        x: {
          tick: {
            count: 25,
            format: function(value) { return moment(value).format(__('MM/DD/YYYY HH:mm')); },
          }},
        y: {
          tick: {
            count: 4,
            format: function(value) { return numeral(value).format('0,0.00a'); },
          }},
      },
      setAreaChart: true,
      subchart: {
        show: true,
      },
    };

    dash.listConfig = {
      selectionMatchProp: 'id',
      showSelectBox: true,
      useExpandingRows: true,
      onCheckBoxChange: selectionChange,
    };

    dash.timeRanges = [
      {title: __('Hours'), value: 1},
      {title: __('Days'), value: 24},
      {title: __('Weeks'), value: 168},
      {title: __('Months'), value: 672},
    ];

    dash.timeIntervals = [
      {title: __('1min Average'), value: 1 * 60},
      {title: __('5min Average'), value: 5 * 60},
      {title: __('20min Average'), value: 20 * 60},
      {title: __('1h average'), value: 60 * 60},
      {title: __('12h average'), value: 12 * 60 * 60},
    ];

    dash.filterType = 'simple';

    dash.filterTypes = [
      {title: __('Advanced filters'), value: 'advanced'},
      {title: __('Simple filters'), value: 'simple'},
    ];

    dash.dateOptions = {
      format: __('MM/DD/YYYY HH:mm'),
    };
  };
});
