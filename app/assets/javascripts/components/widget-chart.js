ManageIQ.angular.app.component('widgetChart', {
  bindings: {
    id: '<',
  },
  controllerAs: 'vm',
  controller: ['$http', 'miqService', '$sce', function($http, miqService, $sce) {
    var vm = this;
    vm.widgetChartModel = {};

    this.$onInit = function() {
      $http.get('/dashboard/widget_chart_data/' + vm.id)
        .then(vm.getData)
        .catch(miqService.handleFailure);
      vm.div_id = "dd_w" + vm.id + "_box";
    };

    vm.getData = function(response) {
      vm.widgetChartModel.state = response.data.state;
      if (response.data.content !== null) {
        vm.widgetChartModel.content = $sce.trustAsHtml(response.data.content);
      }
    };
  }],
  template: [
    '<div class="mc" id="{{vm.div_id}}" ng-class="{ hidden: vm.widgetChartModel.minimized }">',
    '  <div class="blank-slate-pf " style="padding: 10px" ng-if="vm.widgetChartModel.state === \'no_data\'">',
    '    <div class="blank-slate-pf-icon">',
    '      <i class="fa fa-cog">',
    '      </i>',
    '    </div>',
    '    <h1>',
    __('No chart data found.'),
    '    </h1>',
    '  </div>',
    '  <div class="blank-slate-pf " style="padding: 10px" ng-if="vm.widgetChartModel.state === \'invalid\'">',
    '    <div class="blank-slate-pf-icon">',
    '      <i class="fa fa-cog">',
    '      </i>',
    '    </div>',
    '    <h1>',
    __('Invalid chart data.'),
    '    </h1>',
    '    <p>',
    __('Invalid chart data. Try regenerating the widgets.'),
    '    </p>',
    '  </div>',
    '  <div ng-if="vm.widgetChartModel.state === \'valid\'">',
    '    <div ng-bind-html="vm.widgetChartModel.content">',
    '    </div>',
    '  </div>',
    '</div>',
  ].join("\n"),
});
