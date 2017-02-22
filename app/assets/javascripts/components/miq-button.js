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
    this.setTitle = function() {
      if (this.enabledTitle || this.disabledTitle) {
        this.title = this.enabled ? this.enabledTitle : this.disabledTitle;
      }
    };
    this.$onInit = function() {
      this.setTitle();
    };
    this.$onChanges = function(changes) {
      if (changes.enabled) {
        this.enabled = changes.enabled.currentValue;
        this.setTitle();
      }
    };
  },
  template: [
    '<button',
    'ng-class="{btn: true, \'btn-primary\': $ctrl.primary, \'btn-default\': !$ctrl.primary, disabled: !$ctrl.enabled}"',
    'ng-click="$ctrl.buttonClicked()"',
    'ng-attr-title="{{$ctrl.title}}"',
    'ng-attr-alt="{{$ctrl.title}}">',
    '{{$ctrl.name}}',
    '</button>'
  ].join("\n")
});
