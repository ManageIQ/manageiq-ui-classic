ManageIQ.angular.app.component('mwGenericPropertiesComponent', {
  bindings: {
    entity: '@',
    fields: '@',
  },
  controllerAs: 'vm',
  controller: mwGenericPropertiesController,
  template: '<form><formly-form model="vm.mwModel" fields="vm.mwFields"></formly-form></form>',
});

mwGenericPropertiesController.$inject = ['$http', 'miqService'];

function mwGenericPropertiesController($http, miqService) {
  var vm = this;
  var mwModel = [];
  var mwFields = [];

  vm.$onInit = function() {
    vm.loadJson();
  };

  vm.loadJson = function() {
    console.info('Fetching data from /middleware_server/dynamic_ui for: ' + vm.entity);
    console.info('Entity Fields to display: ' + vm.fields);
    var fieldsNoSpaces = vm.fields.replace(/ /g, '');
    var fieldsNoQuotes = fieldsNoSpaces.replace(/'/g, '');
    var displayFields = fieldsNoQuotes.split(',');
    miqService.sparkleOn();
    $http.get('/middleware_server/dynamic_ui/')
      .then(function(response) {
        var jsonData = response.data;
        var selectedItem = selectItem(jsonData, vm.entity);
        vm.mwModel = transformHawkularModelToFormly(selectedItem);
        vm.mwFields = createFormlyTemplateFields(selectedItem, displayFields);
        miqService.sparkleOff();
      })
      .catch(miqService.handleFailure);
  };
  var selectItem = function(hawkularJson, itemName) {
    return _.find(hawkularJson, function(item) {
      return item.name === itemName;
    });
  };
  var transformHawkularModelToFormly = function(item) {
    var tranformedItem = {};
    // placeholder for mutations
    tranformedItem = item;
    return tranformedItem;
  };
  var createFormlyTemplateFields = function(item, displayFields) {
    var fields = [];
    var pickedItem = _.pick(item, displayFields);
    _.each(pickedItem, function(value, prop) {
      fields.push({key: prop, type: 'mw-input', templateOptions: {label: _.capitalize(prop)}});
    });
    return fields;
  };
}
