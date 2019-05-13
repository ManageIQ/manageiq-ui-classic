angular.module('miq.helpers').component('miqTree', {
  bindings: {
    name: '@',
    options: '<',
    bsTree: '<',
  },
  controller: function() {
    this.$onInit = function() {
      miqInitTree(this.options, this.bsTree);
    };
  },
});
