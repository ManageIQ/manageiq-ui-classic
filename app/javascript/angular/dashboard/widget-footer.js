ManageIQ.angular.app.component('widgetFooter', {
  bindings: {
    widgetLastRun: '@',
    widgetNextRun: '@',
  },
  controllerAs: 'vm',
  template: `
    <div class="card-pf-footer">
      ${__('Updated On')}
      {{vm.widgetLastRun}}
      |
      ${__('Next Update On')}
      {{vm.widgetNextRun}}
    </div>
  `,
});
