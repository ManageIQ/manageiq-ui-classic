/* global miqHttpInject */

angular.module( 'patternfly.card' ).controller('physicalInfraStatusCardController', ['providerId', 'API', 'miqService', function(providerId, API, miqService) {
  var vm = this;
  var attributes = ["physical_servers", "physical_racks"];

  var attrIconHsh = {
    "physical_servers": "pficon pficon-cluster",
    "physical_racks": "pficon pficon-enterprise",
  };

  var attrUrl = {
    "physical_servers": "physical_servers",
    "physical_racks": "physical_racks",
  };

  var getIcon = function getIcon(providerType) {
    var type = providerType.split("::");
    return type[2].toLowerCase();
  };

  var getUrl = function(entity) {
    return providerId + "?display=" + attrUrl[entity];
  };

  var getAttributesData = function() {
    vm.status = {
      "iconImage": "/assets/svg/vendor-" + getIcon(vm.provider.type) + ".svg",
      "largeIcon": true,
    };
    var attrHsh = {
      "physical_servers": "Servers",
      "physical_racks": "Racks",
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
  };

  var init = function() {
    ManageIQ.angular.scope = vm;
    API.get("/api/providers/" + providerId + "?attributes=" + attributes)
      .then(function(data) {
        vm.provider = data;
        getAttributesData();
      })
      .catch(miqService.handleFailure);
  };

  init();
}]);
