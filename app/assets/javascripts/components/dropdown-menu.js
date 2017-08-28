ManageIQ.angular.app.component('dropdownMenu', {
  bindings: {
    id: '<',
    buttonsData: '@',
  },
  controllerAs: 'vm',
  controller: function() {
    var vm = this;

    this.$onInit = function() {
      vm.dropdown_id = 'btn_' + vm.id;
      vm.buttons = JSON.parse(vm.buttonsData);
    };
  },
  template: [
    '<div class="dropdown pull-right dropdown-kebab-pf">' +
    '  <button aria-haspopup="true" class="btn btn-link dropdown-toggle" data-toggle="dropdown" id="{{vm.dropdown_id}}" type="button" aria-expanded="false">' +
    '    <span class="fa fa-ellipsis-v">' +
    '    </span>' +
    '  </button>' +
    '  <ul aria-labelledby="{{vm.dropdown_id}}" class="dropdown-menu dropdown-menu-right">' +
    '    <li ng-repeat="button in vm.buttons">' +
    '      <a id="{{button.id}}" title="{{button.title}}" data-method="{{button.dataMethod}}" data-remote="{{button.dataRemote}}" confirm="{{button.confirm}}" href="{{button.href}}" data-miq_spark_on="{{button.sparkleOn}}">' +
    '        <span ng-class="button.fonticon"></span>' +
    '{{button.name}}' +
    '      </a>' +
    '    </li>' +
    '  </ul>' +
    '</div>',
  ].join("\n"),
});
