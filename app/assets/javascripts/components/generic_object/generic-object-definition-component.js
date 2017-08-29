ManageIQ.angular.app.component('genericObjectDefinitionComponent', {
  bindings: {
    recordId: '@?',
    redirectUrl: '@',
  },
  controllerAs: 'vm',
  controller: genericObjectDefinitionFormController,
  templateUrl: '/static/generic_object/generic_object_definition.html.haml',
});

genericObjectDefinitionFormController.$inject = ['API', 'miqService'];

function genericObjectDefinitionFormController(API, miqService) {
  var vm = this;

  vm.$onInit = function() {
    vm.saveable = miqService.saveable;
    vm.afterGet = false;

    vm.attributeTableHeaders = [__("Name"), __("Type"), "", ""];

    vm.types = [
      {id: "integer", name: "integer"},
      {id: "string", name: "string"},
      {id: "boolean", name: "boolean"},
      {id: "datetime", name: "datetime"},
    ];

    vm.genericObjectDefinitionModel = {
      name: '',
      description: '',
      attribute_names: [],
      attribute_types: [],
    };

    if (vm.recordId) {
      vm.newRecord = false;
      miqService.sparkleOn();
      API.get('/api/generic_object_definitions/' + vm.recordId)
        .then(getGenericObjectDefinitionFormData)
        .catch(miqService.handleFailure);
    } else {
      vm.newRecord = true;
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.genericObjectDefinitionModel );
    }
  };

  // private functions
  function getGenericObjectDefinitionFormData(response) {
    Object.assign(vm.genericObjectDefinitionModel, response);

    _.forEach(vm.genericObjectDefinitionModel.properties.attributes, function(value, key) {
      vm.genericObjectDefinitionModel.attribute_names.push(key);
      vm.genericObjectDefinitionModel.attribute_types.push(value);
    });

    vm.noOfRows = _.size(vm.genericObjectDefinitionModel.attribute_names);

    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.genericObjectDefinitionModel );

    miqService.sparkleOff();
  }
}
