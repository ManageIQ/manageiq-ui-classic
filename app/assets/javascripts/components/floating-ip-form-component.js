ManageIQ.angular.app.component('floatingIpFormComponent', {
	controller: 'floatingIpFormController',
	controllerAs: 'vm',
	templateUrl: '/static/floating-ip-form.html.haml',
	bindings: {
		'repositoryId': '@',
	 },
});
