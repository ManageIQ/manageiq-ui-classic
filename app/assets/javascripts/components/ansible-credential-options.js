ManageIQ.angular.app.component('ansibleCredentialOptions', {
  bindings: {
    model: '=',
    options: '<',
    newRecord: '<',
    reset: '=',
    deleteFromModel: '=',
    storedPasswordPlaceholder: '<',
  },

  controllerAs: 'vm',

  controller: ['$scope', function($scope) {
    $scope.__ = __;

    this.updatePassword = function(name) {
      this[name] = true;
      this.model[name] = '';
      // The temp variable is required to make the form dirty and enable Save button
      this.model[name + '_temp'] = this.storedPasswordPlaceholder;
      this.deleteFromModel.push(name + '_temp');
      $scope.$broadcast('reactiveFocus');
    };

    this.cancelPassword = function(name) {
      this[name] = false;
      this.model[name] = undefined;
      this.model[name + '_temp'] = undefined;
    };
  }],

  template: [
    '<div class="form-group" ng-repeat="(name, attr) in vm.options.attributes">',
    '<label class="control-label col-md-2">',
    '{{ __(attr.label) }}',
    '</label>',
    '<div ng-switch="attr.type" class="text">',
    // password or ssh input (must be textarea to prevent EOL getting lost)
    '<div ng-switch-when="password" class="col-md-8">',
    '<input ng-if="!attr.multiline" type="password" value="{{vm.storedPasswordPlaceholder}}" class="form-control" title="{{ __(attr.help_text) }}" ng-disabled="true" ng-hide="vm[name] || vm.newRecord">',
    '<textarea ng-if="attr.multiline" class="form-control" title="{{ __(attr.help_text) }}" ng-disabled="true" ng-hide="vm[name] || vm.newRecord">{{vm.storedPasswordPlaceholder}}</textarea>',
    '<input ng-if="!attr.multiline" type="password" class="form-control" title="{{ __(attr.help_text) }}" ng-hide="!vm[name] && !vm.newRecord" auto-focus="reactiveFocus" ng-model="vm.model[name]">',
    '<textarea ng-if="attr.multiline" class="form-control" title="{{ __(attr.help_text) }}" ng-hide="!vm[name] && !vm.newRecord" auto-focus="reactiveFocus" ng-model="vm.model[name]"></textarea>',
    '</div>',
    '<a href="" ng-switch-when="password" adjust-on-reset="{{name}}" ng-hide="vm[name] || vm.newRecord" ng-click="vm.updatePassword(name)">{{__("Update")}}</a>',
    '<a href="" ng-switch-when="password" ng-hide="!vm[name] || vm.newRecord" ng-click="vm.cancelPassword(name)">{{__("Cancel")}}</a>',
    // select
    '<div ng-switch-when="choice" class="col-md-8">',
    '<select id="{{name}}" miq-select ng-options="opt as opt for opt in attr.choices" class="form-control" ng-model="vm.model[name]" />',
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
  ].join('\n'),
});
