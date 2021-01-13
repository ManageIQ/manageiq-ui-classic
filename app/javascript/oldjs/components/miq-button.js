ManageIQ.angular.app.component('miqButton', {
  bindings: {
    name: '@',
    enabled: '<',
    enabledTitle: '@?',
    disabledTitle: '@?',
    primary: '<?',
    xs: '<?',
    onClick: '&',
  },
  controllerAs: 'vm',
  controller: function() {
    this.buttonClicked = function(event) {
      if (this.enabled) {
        this.onClick();
      }
      event.preventDefault();
      event.target.blur();
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
    'controllerAs="vm"',
    'ng-class="{btn: true, \'btn-primary\': vm.primary, \'btn-xs\': vm.xs, \'btn-default\': !vm.primary, disabled: !vm.enabled}"',
    'ng-click="vm.buttonClicked($event)"',
    'ng-attr-title="{{vm.title}}"',
    'ng-attr-alt="{{vm.title}}">',
    '{{vm.name}}',
    '</button>',
  ].join('\n'),
});
