ManageIQ.angular.app.component('widgetWrapper', {
  bindings: {
    widgetId: '@',
    widgetType: '@',
    widgetButtons: '@',
    widgetBlank: '@',
    widgetTitle: '@',
    widgetLastRun: '@',
    widgetNextRun: '@',
  },
  controllerAs: 'vm',
  controller: ['$http', 'miqService', '$sce', function($http, miqService, $sce) {
    var vm = this;

    this.$onInit = function() {
      vm.divId = "w_" + vm.widgetId;
      vm.innerDivId = 'dd_w' + vm.widgetId + '_box';
      if (vm.widgetBlank == 'false') {
        $http.get(vm.widgetUrl())
          .then(function(response) {
            vm.widgetModel = response.data;
            // if there's html make it passable
            if (vm.widgetModel.content) {
              vm.widgetModel.content =  $sce.trustAsHtml(vm.widgetModel.content);
            };
          })
          .catch(miqService.handleFailure);
      };
    };

    vm.widgetUrl  = function() {
      switch(vm.widgetType){
        case 'menu':
          return '/dashboard/widget_menu_data/' + vm.widgetId;
        case 'report':
          return '/dashboard/widget_report_data/' + vm.widgetId;
        case 'chart':
          return '/dashboard/widget_chart_data/' + vm.widgetId;
        case 'rss':
          return '/dashboard/widget_rss_data/' + vm.widgetId;
        default:
          console.log('Something happened. You can see: ', vm.widgetType);
      };
    };

  }],
  template: [
    '<div id="{{vm.divId}}">',
    '  <div class="card-pf card-pf-view">',
    '    <div class="card-pf-body">',
    '      <div class="card-pf-heading-kebab">',
    '        <dropdown-menu widget-id="{{vm.widgetId}}" buttons-data="{{vm.widgetButtons}}">',
    '        </dropdown-menu>',
    '        <h2 class="card-pf-title sortable-handle ui-sortable-handle" style="cursor:move">',
    "{{vm.widgetTitle}}",
    '        </h2>',
    '      </div>',
    '    </div>',
    '    <div ng-if="vm.widgetBlank === \'true\' || vm.widgetModel" class="mc" id="{{vm.innerDivId}}" ng-class="{ hidden: vm.widgetModel.minimized }">',
    '      <div ng-if="vm.widgetBlank === \'true\'">',
    '        <div class="blank-slate-pf" style="padding: 10px">',
    '          <div class="blank-slate-pf-icon">',
    '            <i class="fa fa-cog"></i>',
    '          </div>',
    '           <h1>',
    __('No data found.'),
    '           </h1>',
    '           <p>',
    __('If this widget is new or has just been added to your dashboard, the data is being generated and should be available soon.'),
    '           </p>',
    '        </div>',
    '      </div>',
    '      <div ng-if="vm.widgetBlank === \'false\'" ng-switch on="vm.widgetType">',
    '        <widget-menu ng-switch-when="menu" widget-id="{{vm.widgetId}}" widget-model="vm.widgetModel">',
    '        </widget-menu>',
    '        <widget-report ng-switch-when="report" widget-id="{{vm.widgetId}}" widget-model="vm.widgetModel">',
    '        </widget-report>',
    '        <widget-chart ng-switch-when="chart" widget-id="{{vm.widgetId}}" widget-model="vm.widgetModel">',
    '        </widget-chart>',
    '        <widget-rss ng-switch-when="rss" widget-id="{{vm.widgetId}}" widget-model="vm.widgetModel">',
    '        </widget-rss>',
    '      </div>',
    '      <div ng-if="vm.widgetType !=\'menu\'" class="card-pf-footer">',
    __('Updated'),
    "{{vm.widgetLastRun}}",
    ' | ',
    __('Next'),
    "{{vm.widgetNextRun}}",
    '      </div>',
    '    </div>',
    '  </div>',
    '</div>',
  ].join("\n"),
});
