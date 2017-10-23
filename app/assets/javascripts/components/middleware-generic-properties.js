ManageIQ.angular.app.component('genericPropertiesComponent', {
  controllerAs: 'vm',
  controller: genericPropertiesController,
  template: '<form><formly-form model="vm.user" fields="vm.userFields"></formly-form></form>',
});

genericPropertiesController.$inject = ['$http', 'miqService'];

function genericPropertiesController($http, miqService) {
  var vm = this;
  vm.user = {};
  vm.userFields = [
    {
      // the key to be used in the model values
      // so this will be bound to vm.user.username
      key: 'username',
      type: 'input',
      templateOptions: {
        label: 'Username',
        placeholder: 'johndoe',
        required: true,
        description: 'Descriptive text'
      }
    },
    {
      key: 'password',
      type: 'input',
      templateOptions: {
        type: 'password',
        label: 'Password',
        required: true
      },
      expressionProperties: {
        'templateOptions.disabled': '!model.username' // disabled when username is blank
      }
    }
  ];

}
