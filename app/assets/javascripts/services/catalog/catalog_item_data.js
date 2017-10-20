ManageIQ.angular.app.service('catalogItemDataFactory', ['API', function(API) {
  var urlBase = '/api/service_templates';

  this.getCatalogItemData = function(st_id) {
    if (st_id !== undefined) {
      return API.get(urlBase + '/' + st_id);
    }
  };
}]);
