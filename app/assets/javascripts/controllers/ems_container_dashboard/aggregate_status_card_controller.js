/* global miqHttpInject */

angular.module( 'patternfly.card' ).controller('aggregateStatusCardContainerController', ['$q', 'providerId', '$http', 'miqService', function($q, providerId, $http, miqService) {
  var vm = this;
  var attributes = ['nodes', 'containers', 'registries', 'projects', 'pods', 'services', 'images', 'routes'];
  var attrHsh = {
    'nodes': __('Nodes'),
    'containers': __('Containers'),
    'registries': __('Registries'),
    'projects': __('Projects'),
    'pods': __('Pods'),
    'services': __('Services'),
    'images': __('Images'),
    'routes': __('Routes'),
  };

  var attrIconHsh = {
    'nodes': 'pficon pficon-container-node',
    'containers': 'fa fa-cube',
    'registries': 'pficon pficon-registry',
    'projects': 'pficon pficon-project',
    'pods': 'fa fa-cubes',
    'services': 'pficon pficon-service',
    'images': 'pficon pficon-image',
    'routes': 'pficon pficon-route',
  };

  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.loadingDone = false;
    var url = '/container_dashboard/data/' + providerId;
    var promiseProviderData = $http.get(url)
      .then(function(data) {
        vm.provider = data;
      })
      .catch(miqService.handleFailure);

    $q.all([promiseProviderData]).then(function() {
      var data = vm.provider.data.data;
      // count and href for all container providers
      var all_providers_info = data.providers[1];

      // icon/notifications and other info for providers
      var providers_info = data.providers[0];

      if (typeof providers_info[0] === 'undefined') {
        vm.status = {};
      } else {
        vm.status = {
          'iconImage': providers_info[0].iconImage,
          'largeIcon': true,
          'notifications': [
            {
              'iconClass': providers_info[0].statusIcon,
            },
          ],
        };
      }

      // show total providers count and link on Containers dashboard only
      if (all_providers_info !== null && typeof all_providers_info.href !== 'undefined') {
        vm.status.title = __('Providers');
        vm.status.count = all_providers_info.count;
        vm.status.href = all_providers_info.href;
      }

      vm.alertStatus = {
        'title': __('Alerts'),
        'notifications': [
          {
            'iconClass': data.alerts.notifications[0].iconClass,
            'href': data.alerts.href,
            'count': data.alerts.notifications[0].count,
            'dataAvailable': data.alerts.dataAvailable,
          },
        ],
      };

      vm.AggStatus = [];
      for (var i = 0; i < attributes.length; i++) {
        var dataStatus = data.status[attributes[i]];
        vm.AggStatus.push({
          'id': attributes[i] + '_' + providerId,
          'iconClass': attrIconHsh[attributes[i]],
          'title': attrHsh[attributes[i]],
          'count': dataStatus.count,
          'href': dataStatus.href,
        });
      }
      vm.loadingDone = true;
    });
  };

  init();
}]);
