ManageIQ.angular.app.component('scheduleFormTimer', {
  bindings: {
    timerTyp: '<',
    scheduleTimerTypeChanged: '&',
    timerValueChange: '&',
    timeZoneChange: '&',
    dateChange: '&',
    startHourChange: '&',
    startMinChange: '&',
    timerValue: '<',
    timerItems: '<',
    timerTypeOnce: '<',
    timerTypeOptions: '<',
    timeZone: '<',
    startDate: '<',
    startHour: '<',
    startMin: '<',
  },
  controller: ['$scope', function($scope) {
    this.dateFrom = new Date()
  }],
  templateUrl: '/static/ops/schedules/schedule-form-timer.html.haml'
})
