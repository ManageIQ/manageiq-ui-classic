class TimelineOptionsController {
  constructor(miqService, url, categories) {
    this.reportModel = {
      tl_show: 'timeline',
      tl_categories: ['Power Activity'],
      tl_timerange: 'weeks',
      tl_timepivot: 'ending',
      tl_result: 'success',
      tl_range_count: 1,
      tl_date: new Date(ManageIQ.calendar.calDateTo),
    };

    this.miqService = miqService;
    this.url = url;
    this.categories = categories;
    this.afterGet  = true;
    this.dateOptions = {
      autoclose: true,
      todayHighlight: true,
      orientation: 'bottom',
    };
    ManageIQ.angular.scope = this;
    this.availableCategories = categories;
  }

  eventTypeUpdated() {
    this.reportModel.tl_categories = [];
  }

  countDecrement() {
    if (this.reportModel.tl_range_count > 1) {
      this.reportModel.tl_range_count -= 1;
    }
  }

  countIncrement() {
    this.reportModel.tl_range_count++;
  }

  applyButtonClicked() {
    if (this.reportModel.tl_categories.length === 0) {
      return;
    }

    // NOTE: process selection
    if (this.reportModel.tl_timerange === 'days') {
      this.reportModel.tl_typ = 'Hourly';
      this.reportModel.tl_days = this.reportModel.tl_range_count;
    } else {
      this.reportModel.tl_typ = 'Daily';
      if (this.reportModel.tl_timerange === 'weeks') {
        this.reportModel.tl_days = this.reportModel.tl_range_count * 7;
      } else {
        this.reportModel.tl_days = this.reportModel.tl_range_count * 30;
      }
    }
    // NOTE: moment is not immutable yet
    let selectedDay = moment(this.reportModel.tl_date);
    let startDay = selectedDay.clone();
    let endDay = selectedDay.clone();

    if (this.reportModel.tl_timepivot === 'starting') {
      endDay.add(this.reportModel.tl_days, 'days').toDate();
      this.reportModel.miq_date = endDay.format('MM/DD/YYYY');
    } else if (this.reportModel.tl_timepivot === 'centered') {
      let enddays = Math.ceil(this.reportModel.tl_days / 2);
      startDay.subtract(enddays, 'days').toDate();
      endDay.add(enddays, 'days').toDate();
      this.reportModel.miq_date = endDay.format('MM/DD/YYYY');
    } else if (this.reportModel.tl_timepivot === 'ending') {
      startDay.subtract(this.reportModel.tl_days, 'days');
      this.reportModel.miq_date = endDay.format('MM/DD/YYYY');
    }
    ManageIQ.calendar.calDateFrom = startDay.toDate();
    ManageIQ.calendar.calDateTo = endDay.toDate();
    if (this.reportModel.tl_show === 'timeline') {
      this.reportModel.tl_fl_typ = this.reportModel.showDetailedEvents ? 'detail' : 'critical';
    }
    this.miqService.sparkleOn();
    this.miqService.miqAsyncAjaxButton(this.url, this.miqService.serializeModel(this.reportModel));
  }
}
TimelineOptionsController.$inject = ['miqService', 'url', 'categories'];
ManageIQ.angular.app.controller('timelineOptionsController', TimelineOptionsController);
