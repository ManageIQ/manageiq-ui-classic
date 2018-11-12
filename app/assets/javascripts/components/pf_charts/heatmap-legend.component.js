angular.module('patternfly.charts').component('pfHeatmapLegend', {
  bindings: {
    legend: '<?',
    legendColors: '<?',
  },
  templateUrl: '/static/pf_charts/heatmap-legend.html.haml',
  controller: function() {
    'use strict';
    var vm = this;

    var heatmapColorPatternDefaults = ['#d4f0fa', '#F9D67A', '#EC7A08', '#CE0000'];
    var legendLabelDefaults = ['< 70%', '70-80%', '80-90%', '> 90%'];

    vm.$onInit = function() {
      vm.updateAll();
    };

    vm.updateAll = function() {
      var items = [];

      // Allow overriding of defaults
      if (!vm.legendColors) {
        vm.legendColors = heatmapColorPatternDefaults;
      }
      if (!vm.legend) {
        vm.legend = legendLabelDefaults;
      }
      for (var i = vm.legend.length - 1; i >= 0; i--) {
        items.push({
          text: vm.legend[i],
          color: vm.legendColors[i],
        });
      }
      vm.legendItems = items;
    };

    vm.$onChanges = function(changesObj) {
      if (changesObj.legend && !changesObj.legend.isFirstChange()) {
        vm.updateAll();
      }
      if (changesObj.legendColors && !changesObj.legendColors.isFirstChange()) {
        vm.updateAll();
      }
    };
  },
});

