ManageIQ.angular.app.component('providerOptionSection', {
  bindings: {
    settings: '<',
    label: '@',
    helpText: '@',
    sectionName: '@',
  },

  templateUrl: '/static/provider_option_section.html.haml',
});

