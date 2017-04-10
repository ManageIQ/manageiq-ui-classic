ManageIQ.angular.app.component('ansibleCredentialOptions', {
  bindings: {
    model: '=',
    options: '<',
    type: '<',
  },

  controllerAs: 'vm',

  controller: ['$scope', function($scope) {
    $scope.__ = __;

    this.setOptions = function() {
      this.current_options = this.options[this.type];
    };

    this.$onInit = function() {
      this.setOptions();
    };

    this.$onChanges = function(changes) {
      this.setOptions();
    };
  }],

  template: [
    '<div class="form-group" ng-repeat="(name, attr) in vm.current_options.attributes">',
      '<label class="control-label col-md-2">',
        '{{ __(attr.label) }}',
       '</label>',
       '<div ng-switch="attr.type" class="text">',
         // password
         '<div ng-switch-when="password" class="col-md-8">',
           '<input type="password" class="form-control" title="{{ __(attr.help_text) }}" ng-model="vm.model[name]">',
         '</div>',
         // select
         '<div ng-switch-when="choice" class="col-md-8">',
            '<select pf-select ng-options="opt as opt for opt in attr.choices" class="form-control" ng-model="vm.model[name]" />',
          '</div>',
         // text
         '<div ng-switch-when="string" class="col-md-8">',
           '<input type="text" class="form-control" title="{{ __(attr.help_text) }}" maxlength="{{ attr.max_length }}" ng-model="vm.model[name]">',
         '</div>',
         // default (text)
         '<div ng-switch-default class="col-md-8">',
           '<input type="text" class="form-control" title="{{ __(attr.help_text) }}" ng-model="vm.model[name]">',
         '</div>',
       '</div>',
     '</div>',
  ].join('\n')
});
