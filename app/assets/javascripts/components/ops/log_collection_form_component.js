ManageIQ.angular.app.component('logCollectionFormComponent', {

  controllerAs: 'vm',

  controller: 'logCollectionFormController',

  templateUrl: "/views/static/ops/logcollection/log_collection.html.haml"

  bindings: {
    'serverId': '@',
  },

});

logCollectionFormComponent.$inject = [];

