ManageIQ.angular.app.component('widgetFooter', {
  bindings: {
    widgetLastRun: '@',
    widgetNextRun: '@',
  },
  controllerAs: 'vm',
  template: [
    '<div class="card-pf-footer">',
    __('Updated'),
    '{{vm.widgetLastRun}}',
    ' | ',
    __('Next'),
    '{{vm.widgetNextRun}}',
    '</div>',
  ].join('\n'),
});
