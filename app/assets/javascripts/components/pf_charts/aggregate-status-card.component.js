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
    vm.$onChanges = function(changes) {
      if (changes.showTopBorder) {
        vm.shouldShowTopBorder = (changes.showTopBorder.currentValue === 'true');
      }
      if (changes.altLayout) {
        vm.isAltLayout = (changes.altLayout.currentValue === 'true');
      }
      if (changes.layout) {
        vm.isAltLayout = (changes.layout.currentValue === 'tall');
        vm.isMiniLayout = (changes.layout.currentValue === 'mini');
      }
    };
  },
});
