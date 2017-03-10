ManageIQ.angular.app.service('catalogItemDataFactory', ['API', function(API) {
  var urlBase = '/api/service_templates';

  this.getCatalogItemData = function (st_id) {
    if(angular.isDefined(st_id)) {
      return API.get(urlBase + '/' + miqUncompressedId(st_id))
    }
  };
}]);

