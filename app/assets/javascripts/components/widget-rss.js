ManageIQ.angular.app.component('widgetRss', {
  bindings: {
    id: '<',
  },
  controllerAs: 'vm',
  controller: ['$http', 'miqService', '$sce', function($http, miqService, $sce) {
    var vm = this;
    vm.widgetRssModel = {};
    this.$onInit = function() {
      $http.get('/dashboard/widget_rss_data/' + vm.id)
        .then(function(response) { vm.widgetRssModel.content = $sce.getTrustedHtml(response.data.content); })
        .catch(miqService.handleFailure);
      vm.div_id = "dd_w" + vm.id + "_box";
    };
    vm.contentPresent = function() {
      return vm.widgetRssModel.content !== undefined;
    };
  }],
  template: [
    '<div class="mc" id={{vm.div_id}}  ng-class="{ hidden: vm.widgetReportModel.minimized }">',
    '  <div class="blank-slate-pf " style="padding: 10px" ng-if="!vm.contentPresent()">',
    '    <div class="blank-slate-pf-icon">',
    '      <i class="fa fa-cog">',
    '      </i>',
    '      <h1>',
    __('No RSS Feed data found'),
    '      </h1>',
    '    </div>',
    '  </div>',
    '  <div ng-if="vm.contentPresent()">',
    '    <div ng-bind-html="vm.widgetRssModel.content">',
    '    </div>',
    '  </div>',
    '</div>',
  ].join("\n"),
});
