ManageIQ.angular.app.component('logCollectionFormComponent', {

  controllerAs: 'vm',

  controller: logCollectionFormController,

  templateUrl: "/static/ops/logcollection/log_collection.html.haml"

  bindings: {
    'serverId': '@',
  },

});

logCollectionFormComponent.$inject = [];

