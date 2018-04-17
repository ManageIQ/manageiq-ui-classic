ManageIQ.angular.app.component('emsKeypairComponent', {
  	controller: 'emsKeypairController',
	controllerAs: 'vm',
	templateUrl: 'auth_keypair_angular_bootstrap.html.haml',
  bindings: {
    'prefix': '@',
    'ng_reqd_userid': '<',
  },
});
