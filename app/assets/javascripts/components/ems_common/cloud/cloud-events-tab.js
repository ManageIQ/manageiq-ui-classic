ManageIQ.angular.app.component('emsCloudEventsTab', {
  bindings: {
    formModel: '<',
    showNone: '<?',
    showCeilometer: '<?',
    eventChanged: '&'
  },
  templateUrl: '/static/ems-common/tabs/events-tab.html.haml',
  controller: function() {

  }
})
