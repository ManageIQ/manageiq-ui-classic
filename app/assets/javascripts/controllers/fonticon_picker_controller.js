/* global add_flash */
(function() {
  var CONTROLLER_NAME = 'fonticonPickerController';

  var FonticonPickerController = function($element) {
    var vm = this;
    // This is an ugly hack to be able to use this component in a non-angular context with miq-observe
    // FIXME: Remove this when the form is converted to angular
    var hidden = $($element[0]).find('input[type="hidden"]');
    vm.select = function(icon) {
      hidden.val(icon);
      hidden.trigger('change');
    };
  };

  FonticonPickerController.$inject = ['$element'];
  window.miqHttpInject(angular.module('ManageIQ.fonticonPicker')).controller(CONTROLLER_NAME, FonticonPickerController);
})();
