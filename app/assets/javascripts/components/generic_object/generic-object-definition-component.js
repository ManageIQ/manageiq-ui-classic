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

    vm.attributeTableHeaders = [__("Name"), __("Type")];
    vm.associationTableHeaders = [__("Name"), __("Class")];
    vm.methodTableHeaders = [__("Name")];

    vm.types = [
      {id: "integer", name: "integer"},
      {id: "string", name: "string"},
      {id: "boolean", name: "boolean"},
      {id: "datetime", name: "datetime"},
    ];

    vm.classes = [
      {id: "Service", name: "Service"},
      {id: "Vm", name: "Vm"},
    ];


    vm.genericObjectDefinitionModel = {
      name: '',
      description: '',
      attribute_names: [],
      attribute_types: [],
      association_names: [],
      association_classes: [],
      method_names: [],
    };

    vm.noOfAttributeRows = 0;
    vm.noOfAssociationRows = 0;
    vm.noOfMethodRows = 0;

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

    vm.noOfAttributeRows = assignObjectToKeyValueArrays(
      vm.genericObjectDefinitionModel.properties.attributes,
      vm.genericObjectDefinitionModel.attribute_names,
      vm.genericObjectDefinitionModel.attribute_types);

    vm.noOfAssociationRows = assignObjectToKeyValueArrays(
      vm.genericObjectDefinitionModel.properties.associations,
      vm.genericObjectDefinitionModel.association_names,
      vm.genericObjectDefinitionModel.association_classes);

    vm.noOfMethodRows = assignObjectToKeyValueArrays(
      vm.genericObjectDefinitionModel.properties.methods,
      vm.genericObjectDefinitionModel.method_names);

    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.genericObjectDefinitionModel );

    miqService.sparkleOff();
  }

  function assignObjectToKeyValueArrays(obj, keyArray, valueArray) {
    if (_.size(obj) == 0) {
      keyArray.push('');
    } else {
      _.forEach(obj, function (value, key) {
        if (valueArray) {
          keyArray.push(key);
          valueArray.push(value);
        } else {
          keyArray.push(value);
        }
      });
    }
    return _.size(keyArray);
  }
}
