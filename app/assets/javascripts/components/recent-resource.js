ManageIQ.angular.app.component('recentResource', {
  bindings: {
    providerId: '@',
    url: '@',
  },
  controllerAs: 'vm',
  controller: resentResourceController,
  templateUrl: '/static/recent-resource.html.haml',
});

resentResourceController.$inject = ['miqService', '$q', '$http', 'chartsMixin'];

function resentResourceController(miqService, $q, $http, chartsMixin) {
  var vm = this;
  this.$onInit = function() {
    vm.id = _.uniqueId('recentResourcesLineChart_' + vm.providerId);
    ManageIQ.angular.scope = vm;
    vm.loadingDone = false;

    vm.config = Object.assign({}, chartsMixin.chartConfig.recentResourcesConfig);
    vm.config.chartId = _.uniqueId(vm.config.chartId);
    vm.config.tooltip.position = vm.config.tooltip.position(vm.config.chartId);

    vm.timeframeLabel = __('Last 30 Days');
    vm.url = vm.url + vm.providerId;
    var resourcesDataPromise = $http.get(vm.url)
      .then(function(response) {
        vm.data = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([resourcesDataPromise]).then(function() {
      if (vm.data.recentResources.dataAvailable === false) {
        vm.data.dataAvailable = false;
      } else {
        vm.data = chartsMixin.processData(vm.data.recentResources, 'dates', vm.data.recentResources.config.label);
      }
      Object.assign(vm.config, vm.data);
      vm.loadingDone = true;
    });

    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custAreaChart = true;
  };
}
