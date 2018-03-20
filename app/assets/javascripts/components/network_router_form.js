ManageIQ.angular.app.component('networkRouterForm',{
  controller: 'networkRouterFormController',
  controllerAs: 'vm',
  templateUrl: '/static/network-router-form.html.haml',
  bindings: {
    'networkRouterId': '@',
    'networkProviderChoices' : '<'
  },
});
