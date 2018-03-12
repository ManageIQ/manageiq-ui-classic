angular.module('miq.util').factory('metricsConfigFactory', function() {
  return function(dash) {
    function selectionChange(item) {
      if (item.selected) {
        dash.selectedItems.push(item);
      } else {
        dash.selectedItems = dash.selectedItems.filter(function(obj) {
          return obj.id !== item.id;
        });
      }

      dash.itemSelected = dash.selectedItems.length > 0;
    }

    dash.DEFAULT_HAWKULAR_TENANT = '_system';
    dash.tenant = { value: null };

    dash.actionsConfig = {
      actionsInclude: true,
    };

    dash.timeFilter = {
      time_range: '-1h',
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
            format: function(value) {
              return moment(value).format(__('MM/DD/YYYY HH:mm'));
            },
          },
        },
        y: {
          tick: {
            count: 4,
            format: function(value) {
              return numeral(value).format('0,0.00a');
            },
          },
        },
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
      { title: __('Hour'), value: '-1h' },
      { title: __('6 Hours'), value: '-6h' },
      { title: __('12 Hours'), value: '-12h' },
      { title: __('Day'), value: '-1d' },
      { title: __('7 Days'), value: '-7d' },
    ];

    dash.timeRangesToSec = {
      '-1h': 60 * 60,
      '-6h': 6 * 60 * 60,
      '-12h': 12 * 60 * 60,
      '-1d': 24 * 60 * 60,
      '-7d': 7 * 24 * 60 * 60,
    };

    dash.dbName = 'Hawkular';
    dash.bucketDuration = 120;
    dash.pageSizeIncrements = [
      { title: __('5 items'), value: 5 },
      { title: __('10 items'), value: 10 },
      { title: __('20 items'), value: 20 },
      { title: __('40 items'), value: 40 },
      { title: __('80 items'), value: 80 },
    ];

    dash.showRegexp = false;
  };
});
