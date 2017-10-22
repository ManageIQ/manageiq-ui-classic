/* global miqHttpInject */

angular.module( 'patternfly.card' ).controller('aggregateStatusCardContainerController', ['$q', 'providerId', '$http', 'miqService', function($q, providerId, $http, miqService) {
  var vm = this;
  var attributes = ["nodes", "containers", "registries", "projects", "pods", "services", "images", "routes"];
  var attrHsh = {
    "nodes": "Nodes",
    "containers": "Containers",
    "registries": "Registries",
    "projects": "Projects",
    "pods": "Pods",
    "services": "Services",
    "images": "Images",
    "routes": "Routes",
  };

  var attrIconHsh = {
    "nodes": "pficon pficon-container-node",
    "containers": "fa fa-cube",
    "registries": "pficon pficon-registry",
    "projects": "pficon pficon-project",
    "pods": "fa fa-cubes",
    "services": "pficon pficon-service",
    "images": "pficon pficon-image",
    "routes": "pficon pficon-route",
  };
//
//   var attrUrl = {
//     "nodes": "container_node",
//     "containers": "container",
//     "registries": "container_image_registry",
//     "projects": "container_project",
//     "pods": "container_group",
//     "services": "container_service",
//     "images": "container_image",
//     "routes": "container_route",
//   };

  var init = function() {
    ManageIQ.angular.scope = vm;
    var url = '/container_dashboard/data/' + providerId;
    var promiseProviderData = $http.get(url)
      .then(function(data) {
        vm.provider = data;
      })
      .catch(miqService.handleFailure);

    $q.all([promiseProviderData]).then(function() {
      data = vm.provider.data.data

      vm.status = {
        "iconImage": data.providers[0].iconImage,
        "largeIcon": true,
        "notifications":[
          {
            "iconClass": data.providers[0].statusIcon,
            "iconClass": data.alerts.notifications[0].iconClass,
          },
        ]
      };

      vm.alertStatus = {
        "title": "Alerts",
        "notifications":[
          {
            "iconClass": data.alerts.notifications[0].iconClass,
          },
        ]
      };

      vm.AggStatus = [];
      for (var i = 0; i < attributes.length; i++) {
        data_status = data.status[attributes[i]];
        vm.AggStatus.push({
          "id": attributes[i] + '_' + providerId,
          "iconClass": attrIconHsh[attributes[i]],
          "title": attrHsh[attributes[i]],
          "count": data_status.count,
          "href": data_status.href,
          "notification": {
            "iconClass": "pficon pficon-error-circle-o",
            "count": 0,
          },
        });
      }
    });
  };

  init();
}]);
