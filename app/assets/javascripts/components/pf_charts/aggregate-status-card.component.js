angular.module( 'patternfly.card' ).component('pfAggregateStatusCard', {
  bindings: {
    status: '=',
    showTopBorder: '@?',
    altLayout: '@?',
    layout: '@?',
  },
  templateUrl: '/static/pf_charts/aggregate-status-card.html.haml',
  controller: function() {
    'use strict';
    var vm = this;
    vm.$onInit = function() {
      vm.shouldShowTopBorder = (vm.showTopBorder === 'true');
      vm.isAltLayout = (vm.altLayout === 'true' || vm.layout === 'tall');
      vm.isMiniLayout = (vm.layout === 'mini');
    };
  },
});
