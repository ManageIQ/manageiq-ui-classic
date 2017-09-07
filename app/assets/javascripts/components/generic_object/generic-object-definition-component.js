ManageIQ.angular.app.component('genericObjectDefinitionComponent', {
  bindings: {
    recordId: '@?',
    redirectUrl: '@',
  },
  controllerAs: 'vm',
  controller: genericObjectDefinitionFormController,
  templateUrl: '/static/generic_object/generic_object_definition.html.haml',
});

genericObjectDefinitionFormController.$inject = ['API', 'miqService', '$q'];

function genericObjectDefinitionFormController(API, miqService, $q) {
  var vm = this;

  vm.$onInit = function() {
    vm.entity = __('Generic Object Class');
    vm.saveable = miqService.saveable;
    vm.afterGet = false;

    vm.attributeTableHeaders = [__("Name"), __("Type")];
    vm.associationTableHeaders = [__("Name"), __("Class")];
    vm.methodTableHeaders = [__("Name")];

    vm.types = [];
    vm.classes = [];

    vm.genericObjectDefinitionModel = {
      name: '',
      description: '',
      properties: {},
      attribute_names: [],
      attribute_types: [],
      attributesTableChanged: false,
      association_names: [],
      association_classes: [],
      associationsTableChanged: false,
      method_names: [],
      methodsTableChanged: false,
    };

    var optionsPromise = API.options('/api/generic_object_definitions/')
      .then(getGenericObjectDefinitionOptions)
      .catch(miqService.handleFailure);

    if (vm.recordId) {
      vm.newRecord = false;
      miqService.sparkleOn();
      var dataPromise = API.get('/api/generic_object_definitions/' + vm.recordId)
        .then(getGenericObjectDefinitionFormData)
        .catch(miqService.handleFailure);

      $q.all([optionsPromise, dataPromise])
        .then(promisesResolvedForLoad);
    } else {
      vm.newRecord = true;
      vm.afterGet = true;

      vm.modelCopy = angular.copy( vm.genericObjectDefinitionModel );
    }
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    if (vm.newRecord) {
      miqService.redirectBack(sprintf(__('Creation of new %s was canceled by the user.'), vm.entity), 'warning', vm.redirectUrl);
    } else {
      miqService.redirectBack(sprintf(__('Edit of %s \"%s\" was canceled by the user.'), vm.entity, vm.genericObjectDefinitionModel.name), 'warning', vm.redirectUrl);
    }
  };

  vm.resetClicked = function(angularForm) {
    vm.genericObjectDefinitionModel = Object.assign({}, vm.modelCopy);

    assignAllObjectsToKeyValueArrays(true);

    angularForm.$setUntouched(true);
    angularForm.$setPristine(true);

    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    var saveMsg = sprintf(__('%s \"%s\" has been successfully saved.'), vm.entity, vm.genericObjectDefinitionModel.name);
    vm.saveWithAPI('put', '/api/generic_object_definitions/' + vm.recordId, vm.prepSaveObject(), saveMsg);
  };

  vm.addClicked = function() {
    var saveMsg = sprintf(__('%s \"%s\" has been successfully added.'), vm.entity, vm.genericObjectDefinitionModel.name);
    vm.saveWithAPI('post', '/api/generic_object_definitions/', vm.prepSaveObject(), saveMsg);
  };

  vm.prepSaveObject = function() {
    vm.genericObjectDefinitionModel.properties.attributes = {};
    vm.genericObjectDefinitionModel.properties.associations = {};
    vm.genericObjectDefinitionModel.properties.methods = [];

    vm.genericObjectDefinitionModel.properties.attributes = _.zipObject(
      vm.genericObjectDefinitionModel.attribute_names,
      vm.genericObjectDefinitionModel.attribute_types);

    vm.genericObjectDefinitionModel.properties.associations = _.zipObject(
      vm.genericObjectDefinitionModel.association_names,
      vm.genericObjectDefinitionModel.association_classes);

    vm.genericObjectDefinitionModel.properties.methods = vm.genericObjectDefinitionModel.method_names;

    return {
      name: vm.genericObjectDefinitionModel.name,
      description: vm.genericObjectDefinitionModel.description,
      properties: vm.genericObjectDefinitionModel.properties,
    };
  };

  vm.saveWithAPI = function(method, url, saveObject, saveMsg) {
    miqService.sparkleOn();
    API[method](url, saveObject)
      .then(miqService.redirectBack.bind(vm, saveMsg, 'success', vm.redirectUrl))
      .catch(miqService.handleFailure);
  };

  vm.methodsArrayEmpty = function() {
    var bArrayEmpty = true;
    _.forEach(vm.genericObjectDefinitionModel.method_names, function(item) {
      if (item !== '' && item !== null && item !== undefined) {
        bArrayEmpty = false;
        return false;
      }
    });
    return bArrayEmpty;
  };

  // private functions
  function getGenericObjectDefinitionFormData(response) {
    Object.assign(vm.genericObjectDefinitionModel, response);

    assignAllObjectsToKeyValueArrays();
  }

  function assignAllObjectsToKeyValueArrays(purge) {
    if (purge) {
      vm.genericObjectDefinitionModel.attribute_names = [];
      vm.genericObjectDefinitionModel.attribute_types = [];
      vm.genericObjectDefinitionModel.association_names = [];
      vm.genericObjectDefinitionModel.association_classes = [];
      vm.genericObjectDefinitionModel.method_names = [];
    }

    vm.genericObjectDefinitionModel.noOfAttributeRows = assignObjectToKeyValueArrays(
      vm.genericObjectDefinitionModel.properties.attributes,
      vm.genericObjectDefinitionModel.attribute_names,
      vm.genericObjectDefinitionModel.attribute_types);

    vm.genericObjectDefinitionModel.noOfAssociationRows = assignObjectToKeyValueArrays(
      vm.genericObjectDefinitionModel.properties.associations,
      vm.genericObjectDefinitionModel.association_names,
      vm.genericObjectDefinitionModel.association_classes);

    vm.genericObjectDefinitionModel.noOfMethodRows = assignObjectToKeyValueArrays(
      vm.genericObjectDefinitionModel.properties.methods,
      vm.genericObjectDefinitionModel.method_names);

    vm.modelCopy = Object.assign({}, vm.genericObjectDefinitionModel);
    vm.modelCopy = Object.freeze(vm.modelCopy);
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

  function getGenericObjectDefinitionOptions(response) {
    buildOptionObject(response.data.allowed_association_types, vm.classes);
    buildOptionObject(response.data.allowed_types, vm.types);
  }

  function buildOptionObject(optionData, optionObject) {
    _.forEach(optionData, function (item) {
      optionObject.push({id: item[1], name: item[0]});
    });
  }

  function promisesResolvedForLoad() {
    vm.afterGet = true;
    miqService.sparkleOff();
  }
}
