angular.module('ManageIQ')
  .component('miqSanitize', {
    bindings: {
      value: '@',
    },
    template: '<span ng-bind-html="$ctrl.value"></span>',
  });
