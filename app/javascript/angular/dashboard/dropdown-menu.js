ManageIQ.angular.app.component('dropdownMenu', {
  bindings: {
    widgetId: '@',
    buttonsData: '<',
  },
  controllerAs: 'vm',
  controller() {
    const vm = this;

    vm.$onInit = function() {
      vm.dropdown_id = `btn_${vm.widgetId}`;
      vm.buttons = vm.buttonsData;
    };

    vm.click = function(button) {
      if (button.onclick) {
        return button.onclick();
      }
      return true;
    };
  },
  template: `
    <div class="dropdown pull-right dropdown-kebab-pf">
      <button aria-expanded="false"
              aria-haspopup="true"
              class="btn btn-link dropdown-toggle"
              data-toggle="dropdown"
              id="{{vm.dropdown_id}}"
              type="button">
        <span class="fa fa-ellipsis-v"></span>
      </button>
      <ul aria-labelledby="{{vm.dropdown_id}}"
          class="dropdown-menu dropdown-menu-right">
        <li ng-repeat="button in vm.buttons">
          <a data-confirm="{{button.confirm}}"
             data-method="{{button.dataMethod}}"
             data-miq_sparkle_on="{{button.sparkleOn ? 'true' : 'false'}}"
             href="{{button.href}}"
             ng-click="vm.click(button)"
             id="{{button.id}}"
             ng-attr-data-remote="{{button.dataRemote}}"
             ng-attr-target="{{button.target}}"
             title="{{button.title}}">
            <span ng-class="button.fonticon"></span>
            {{button.name}}
          </a>
        </li>
      </ul>
    </div>
  `,
});
