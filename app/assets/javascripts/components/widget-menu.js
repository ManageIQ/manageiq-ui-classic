ManageIQ.angular.app.component('widgetMenu', {
  bindings: {
    id: '<'
  },
  controllerAs: 'vm',
  controller: ['$http', 'miqService', function($http) {
    var vm = this;
    vm.div_id = 0;
    vm.widgetMenuModel = {
      id: 0,
      shortcuts: []
    };
    vm.shortcutsMissing = function(){
      return false;
    };
    this.$onInit = function() {
      $http.get('/dashboard/widget_menu_data/' + vm.id)
        .then(getWidgetMenuDataComplete)
        .catch(miqService.handleFailure);
      vm.div_id = 'dd_w' + vm.widgetMenuModel.id + '_box';
    };
    this.$onChanges = function(changes) {

    };
    function getWidgetMenuDataComplete(response) {
      var data = response.data;
      vm.widgetMenuModel = data;
    }
  }],
  template: [
    '<div class="mc" id={{vm.div_id}} >',
      '<table class="table table-hover">',
        '<tbody>',
          '<div ng-if="vm.shortcutsMissing()">',
            __('No shortcuts are authorized for this user, contact your Administrator'),
          '</div>',
          '<tr ng-if="!vm.shortcutsMissing()" ng-repeat="shortcut in vm.widgetMenuModel.shortcuts">',
            '<td>',
             '<a title="'+ __("Click to go this location") +'" href="{{shortcut.href}}">',
              '{{shortcut.description}}',
             '</a>',
            '</td>',
          '</tr>',
        '</tbody>',
      '</table>',
    '</div>'
  ].join("\n")
});
