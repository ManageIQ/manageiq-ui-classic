angular.module('patternfly.charts').component('pfEmptyChart', {
  bindings: {
    chartHeight: '<?',
  },
  templateUrl: '/static/pf_charts/empty-chart.html.haml',
  controller: function() {
    'use strict';
    var vm = this;

    vm.setSizeStyles = function() {
      var height = vm.chartHeight || 40;
      var topPadding = Math.min(Math.round((height - 40) / 2), 20);
      vm.sizeStyles = {
        height: height + 'px',
        'padding-top': topPadding + 'px',
      };
    };
    vm.setSizeStyles();

    vm.$onChanges =  function(changesObj) {
      if (changesObj.chartHeight) {
        vm.setSizeStyles();
      }
    };
  },
});
