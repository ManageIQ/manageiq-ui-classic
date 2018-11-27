ManageIQ.angular.app.component('widgetReport', {
  bindings: {
    widgetId: '@',
    widgetModel: '<',
  },
  controllerAs: 'vm',
  controller: function() {
    var vm = this;
    vm.contentPresent = function() {
      return vm.widgetModel && vm.widgetModel.content !== undefined;
    };
  },
  template: [
    '<div class="blank-slate-pf " style="padding: 10px" ng-if="!vm.contentPresent()">',
    '  <div class="blank-slate-pf-icon">',
    '    <i class="fa fa-cog">',
    '    </i>',
    '    <h1>',
    __('No report data found.'),
    '    </h1>',
    '  </div>',
    '</div>',
    '<div ng-if="vm.contentPresent()">',
    '  <div ng-bind-html="vm.widgetModel.content">',
    '  </div>',
    '</div>',
  ].join('\n'),
});
