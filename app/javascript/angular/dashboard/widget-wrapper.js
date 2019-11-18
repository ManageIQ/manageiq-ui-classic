/* global miqDeferred */

ManageIQ.angular.app.component('widgetWrapper', {
  bindings: {
    widgetId: '@',
    widgetType: '@',
    widgetButtons: '@',
    widgetTitle: '@',
    widgetLastRun: '@',
    widgetNextRun: '@',
  },
  controllerAs: 'vm',
  controller: ['$http', 'miqService', '$sce', 'API', function($http, miqService, $sce, API) {
    const vm = this;

    const widgetTypeUrl = {
      menu: '/dashboard/widget_menu_data/',
      report: '/dashboard/widget_report_data/',
      chart: '/dashboard/widget_chart_data/',
    };

    const deferred = miqDeferred();
    vm.promise = deferred.promise;

    vm.$onInit = function() {
      vm.divId = `w_${vm.widgetId}`;
      vm.innerDivId = `dd_w${vm.widgetId}_box`;
      vm.refreshWidgetHTML(false);
      vm.parsedButtons = JSON.parse(vm.widgetButtons);
      const refreshButton = vm.parsedButtons.find(ob => ob.id.includes("refresh"));
      if (refreshButton) {
        refreshButton.onclick = vm.refresh;
      };
    };

    vm.refreshWidgetHTML = function(refreshed) {
      return $http.get(vm.widgetUrl())
        .then((response) => {
          vm.widgetModel = response.data;
          // if there's html make it passable
          if (vm.widgetModel.content) {
            vm.widgetModel.content = $sce.trustAsHtml(vm.widgetModel.content);
          }
          if (refreshed) {
            miqSparkleOff();
            add_flash(sprintf(__('Dashboard "%s" was refreshed'), vm.widgetTitle), 'success');
          }
          vm.error = false;
          deferred.resolve();
        })
        .catch((e) => {
          vm.error = true;
          vm.widgetModel = null;
          miqService.handleFailure(e);
          deferred.reject();
        });
    };

    vm.refresh = function() {
      $http.post(`/dashboard/widget_refresh/?widget=${vm.widgetId}`)
        .then((response) => {
          vm.widgetModel = null;
          return API.wait_for_task(response.data.task_id).then(vm.refreshWidgetHTML(true));
        })
        .catch((e) => {
          vm.error = true;
          vm.widgetModel = null;
          miqService.handleFailure(e);
          deferred.reject();
        });
    };

    vm.widgetUrl = function() {
      if (widgetTypeUrl[vm.widgetType]) {
        return [widgetTypeUrl[vm.widgetType], vm.widgetId].join('/');
      }

      console.log('Something went wrong. There is no support for widget type of ', vm.widgetType);
    };
  }],
  template: `
    <div ng-attr-id="{{vm.divId}}">
      <div class="card-pf card-pf-view">
        <div class="card-pf-body">
          <div class="card-pf-heading-kebab">
            <dropdown-menu widget-id="{{vm.widgetId}}"
                           buttons-data="vm.parsedButtons"></dropdown-menu>
            <h2 class="card-pf-title sortable-handle ui-sortable-handle"
                style="cursor:move">
              {{vm.widgetTitle}}
            </h2>
          </div>
        </div>
        <widget-error ng-if="vm.error === true"></widget-error>
        <widget-spinner ng-if="!vm.widgetModel && !vm.error"></widget-spinner>
        <div ng-if="vm.widgetModel"
             ng-attr-id="{{vm.innerDivId}}"
             ng-class="{ hidden: vm.widgetModel.minimized, mc:true }">
          <widget-empty ng-if="vm.widgetModel.blank === true"></widget-empty>
          <div ng-if="vm.widgetModel.blank === false"
               ng-switch on="vm.widgetType">
            <widget-menu ng-switch-when="menu"
                         widget-id="{{vm.widgetId}}"
                         widget-model="vm.widgetModel"></widget-menu>
            <widget-report ng-switch-when="report"
                           widget-id="{{vm.widgetId}}"
                           widget-model="vm.widgetModel"></widget-report>
            <widget-chart ng-switch-when="chart"
                          widget-id="{{vm.widgetId}}"
                          widget-model="vm.widgetModel"></widget-chart>
            <widget-rss ng-switch-when="rss"
                        widget-id="{{vm.widgetId}}"
                        widget-model="vm.widgetModel"></widget-rss>
          </div>
          <widget-footer widget-last-run="{{vm.widgetLastRun}}"
                         widget-next-run="{{vm.widgetNextRun}}"
                         ng-if="vm.widgetType !='menu'"></widget-footer>
        </div>
      </div>
    </div>
  `,
});
