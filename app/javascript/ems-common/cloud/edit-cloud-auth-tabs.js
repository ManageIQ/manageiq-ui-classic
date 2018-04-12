class EditCloudAuthTabs {
  $onInit() {
    this.activeTab = this.activeTab || this.tabs[0];
  }

  changeAuthTab = (tab) => {
    this.activeTab = tab;
    this.changeActiveTab({ tab });
  }
}

ManageIQ.angular.app.component('emsEditCloudAuthTabs', {
  bindings: {
    tabs: '<',
    activeTab: '@?',
    changeActiveTab: '&',
  },
  templateUrl: '/static/ems-common/edit-cloud-auth-tabs.html.haml',
  controller: EditCloudAuthTabs,
});
