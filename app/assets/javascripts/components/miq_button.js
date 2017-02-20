ManageIQ.angular.app.component('miqButton', {
  bindings: {
    name: '@',
    enabled: '<',
    enabledTitle: '@?',
    disabledTitle: '@?',
    primary: '<?',
    onClick: '&',
  },
  controller: function() {
    this.buttonClicked = function($event) {
      if (this.enabled) {
        this.onClick();
      }
    };
    this.$onInit = function() {

    };
    this.$onChanges = function(changes) {
      if (changes.enabled) {
        this.enabled = changes.enabled.currentValue;

      }
    };
  },
  template: '<button name="button" type="submit" ng-class="{btn: true, \'btn-primary\': $ctrl.primary, \'btn-default\': !$ctrl.primary, disabled: !$ctrl.enabled}" ng-click="$ctrl.buttonClicked()">{{$ctrl.name}}</button>'
});
