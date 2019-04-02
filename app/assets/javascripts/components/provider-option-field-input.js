ManageIQ.angular.app.component('providerOptionFieldInput', {
  bindings: {
    option: '<',
    sectionName: '@',
  },

  controller: function() {
    var ctrl = this;

    ctrl.$onInit = function() {
      ctrl.elemID = 'provider_options_' + ctrl.sectionName + '_' + ctrl.option.name;
    };
  },

  templateUrl: '/static/provider_option_field_input.html.haml',
});
