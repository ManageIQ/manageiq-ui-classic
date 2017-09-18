/* global miqHttpInject */

angular.module( 'patternfly.card' ).controller('aggregateStatusCardController', ['$scope', '$q', 'providerId','API', function($scope, $q, providerId, API) {
  var vm = this;
  var attributes = ["ems_clusters", "hosts", "storages", "vms", "miq_templates"];
  var attrHsh = {
    "ems_clusters": "Clusters",
    "hosts": "Hosts",
    "storages": "Datastores",
    "vms": "VMs",
    "miq_templates": "Templates"
  }

  var attrIconHsh = {
    "ems_clusters": "pficon pficon-cluster",
    "hosts": "pficon pficon-screen",
    "storages": "fa fa-database",
    "vms": "pficon pficon-virtual-machine",
    "miq_templates": "pficon pficon-virtual-machine"
  }

  var attrUrl = {
    "ems_clusters": "ems_clusters",
    "hosts": "hosts",
    "storages": "storages",
    "vms": "vms",
    "miq_templates": "miq_templates"
  }

  var init = function() {
    ManageIQ.angular.scope = vm;
    var promiseProviderData = API.get("/api/providers/" + providerId + "?attributes=" + attributes).then(function(data) {
      vm.provider = data;
    })

    $q.all([promiseProviderData]).then(function() {
      vm.status = {
//         "title": vm.provider.name,
        "iconImage": "/assets/svg/vendor-" + getIcon(vm.provider.type) + ".svg",
        "largeIcon": true
      };

      vm.AggStatus = [];
      for (i = 0; i < attributes.length; i++) {
        vm.AggStatus.push({
          "iconClass": attrIconHsh[attributes[i]],
          "title": attrHsh[attributes[i]],
          "count": vm.provider[attributes[i]].length,
          "href": getUrl(providerId, attributes[i]),
          "notification": {
            "iconClass": "pficon pficon-error-circle-o",
            "count": 0
          }
        });
      }
    })

  }

  var getProviderData = function(response) {
    Object.assign(vm.provider, response);
  };

  var getIcon = function getIcon(providerType) {
    var type = providerType.split("::");
    return type[2].toLowerCase();
  };

  var getUrl = function(providerId, entity) {
    return providerId + "?display=" + attrUrl[entity];
  };

  init();
}]);
