/* global miqHttpInject */

angular.module( 'patternfly.card' ).controller('aggregateStatusCardController', ['$q', 'providerId', 'API', 'miqService', 'chartsMixin', function($q, providerId, API, miqService, chartsMixin) {
  var vm = this;
  var attributes = ["ems_clusters", "hosts", "storages", "vms", "miq_templates"];

  var attrIconHsh = {
    "ems_clusters": "pficon pficon-cluster",
    "hosts": "pficon pficon-screen",
    "storages": "fa fa-database",
    "vms": "pficon pficon-virtual-machine",
    "miq_templates": "pficon pficon-virtual-machine",
  };

  var attrUrl = {
    "ems_clusters": "ems_clusters",
    "hosts": "hosts",
    "storages": "storages",
    "vms": "vms",
    "miq_templates": "miq_templates",
  };

  var init = function() {
    ManageIQ.angular.scope = vm;
    var promiseProviderData = API.get("/api/providers/" + providerId + "?attributes=" + attributes)
      .then(function(data) {
        vm.provider = data;
      })
      .catch(miqService.handleFailure);

    $q.all([promiseProviderData]).then(function() {
      vm.status = {
//         "title": vm.provider.name,
        "iconImage": "/assets/svg/vendor-" + getIcon(vm.provider.type) + ".svg",
        "largeIcon": true,
      };

      var attrHsh = {
        "ems_clusters": chartsMixin.isOpenstack(vm.provider.type) ? "Deployment Roles" : "Clusters",
        "hosts": chartsMixin.isOpenstack(vm.provider.type) ? "Nodes" : "Hosts",
        "storages": "Datastores",
        "vms": "VMs",
        "miq_templates": "Templates",
      };

      vm.AggStatus = [];
      for (var i = 0; i < attributes.length; i++) {
        vm.AggStatus.push({
          "id": attrHsh[attributes[i]] + '_' + providerId,
          "iconClass": attrIconHsh[attributes[i]],
          "title": __(attrHsh[attributes[i]]),
          "count": vm.provider[attributes[i]].length,
          "href": getUrl(attributes[i]),
          "notification": {
            "iconClass": "pficon pficon-error-circle-o",
            "count": 0,
          },
        });
      }
    });
  };

  var getIcon = function getIcon(providerType) {
    var type = providerType.split("::");
    return type[2].toLowerCase();
  };

  var getUrl = function(entity) {
    return providerId + "?display=" + attrUrl[entity];
  };

  init();
}]);
