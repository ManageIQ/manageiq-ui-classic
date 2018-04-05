ManageIQ.angular.app.component('emsEditCloudAuthTabs', {
  bindings: {
    tabs: '<',
    activeTab: '@?',
    changeActiveTab: '&',
  },
  templateUrl: '/static/ems-common/edit-cloud-auth-tabs.html.haml',
  controller: function() {
    this.$onInit = function() {
      this.activeTab = this.activeTab || this.tabs[0];
    };

    this.changeAuthTab = function(tab) {
      this.activeTab = tab;
      this.changeActiveTab({tab: tab});
    };
  },
});
