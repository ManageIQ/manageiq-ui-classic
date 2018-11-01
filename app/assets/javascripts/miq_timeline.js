(function() {
  var element;
  var timeline;

  function handlePopover(element) {
    var popover = '';
    if (element.hasOwnProperty('events')) {
      popover = sprintf(__('Group of %s events'), element.events.length);
    } else {
      for (var i in element.details) {
        popover = popover + element.details[i];
      }
    }
    return popover;
  }

  function eventClick(el) {
    var table = '<table class="table table-striped table-bordered">';
    // clear all popovers on new click
    $('[data-toggle="popover"]').popover('hide');

    $(d3.event.target).popover('toggle');

    $(d3.event.target).on('shown.bs.popover', { target: d3.event.target }, function(event) {
      $(document).on('click', { target: event.data.target }, hidePopover);
    });

    if (el.hasOwnProperty('events')) {
      var i;
      table = table + '<thead>' + sprintf(__('This is a group of %s events starting on %s'), el.events.length, el.date.toLocaleString()) + '</thead><tbody>';
      table = table + '<tr><th>' + __('Date') + '</th><th>' + __('Event') + '</th></tr>';
      for (i = 0; i < el.events.length; i++) {
        table = table + '<tr><td>' + el.events[i].date.toLocaleString() + ' </td> ';
        for (var j in el.events[i].details) {
          table = table + '<td> ' + el.events[i].details[j] + ' </td> ';
        }
        table = table + '</tr>';
      }
      table = table + '</tbody>';
    } else {
      table = table + __('Date: ') + el.date.toLocaleString() + '<br>';
      for (i in el.details) {
        table = table + el.details[i] + '<br>';
      }
    }
    $('#legend').html(table);
  }

  function hidePopover(event) {
    $(event.data.target).popover('hide');
    $(event.data.target).off('shown.bs.popover');
    $(document).off('click', hidePopover);
  }

  function createTooltip() {
    if (timeline && timeline.constructor && timeline.call && timeline.apply) {
      timeline(element);
    }
    $('[data-toggle="popover"]').popover({
      'container': '#tl_div',
      'trigger': 'manual',
      'placement': 'top',
      'html': true,
    });
  }

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function selectSevereer(severityX, severityY) {
    var weight = {
      detail: 0,
      warning: 1,
      critical: 2,
    };
    return (weight[severityX] > weight[severityY] ? severityX : severityY);
  }

  function eventColor(eventData) {
    var colors = {
      detail: '#00659C',
      critical: '#C00019',
      warning: '#E17B1C',
    };

    if (eventData.hasOwnProperty('events')) {
      var severity = 'detail';
      var eventList = eventData.events;
      for (var i = 0; i < eventList.length; i++) {
        severity = selectSevereer(eventList[i].data.group_level.value, severity);
      }
      return colors[severity];
    }
    return colors[eventData.data.group_level.value];
  }

  function createTimelineLegend(eventData) {
    var legendHTML = '';
    for (var property in eventData) {
      var value = eventData[property].value;
      if (property === 'group_level') {
        var color = eventColor({data: eventData});
        value = "<text style='color:" + color + "'>" + capitalize(value) + '</text>';
      }
      legendHTML += '<b>' + eventData[property].text + ':</b>&nbsp;' + value + '<br/>';
    }
    return legendHTML;
  }

  ManageIQ.Timeline = {
    load: function(json, start, end) {
      var data = [];
      var one_hour = 60 * 60 * 1000;
      var dataHasName = false;
      for (var x in json) {
        data[x] = {};
        if (json[x].name !== undefined && json[x].name !== '') {
          dataHasName = true;
          data[x].name = json[x].name;
        }
        data[x].data = [];
        if (json[x].data !== undefined && json[x].data.length > 0) {
          var timelinedata = json[x].data[0];
          for (var y in timelinedata) {
            var eventData = timelinedata[y].event;
            data[x].data.push({});
            data[x].data[y].data = eventData;
            data[x].data[y].date = new Date(timelinedata[y].start);
            data[x].data[y].details = {};
            data[x].data[y].details.event = createTimelineLegend(eventData);
          }
          data[x].display = true;
        }
      }
      var timeSpanMilliseconds = end.getTime() - start.getTime();
      timeline = d3.chart.timeline().end(end).start(start)
        .minScale(1)
        .maxScale(timeSpanMilliseconds / one_hour)
        .eventGrouping(360000).labelWidth(170)
        .eventColor(eventColor)
        .eventPopover(handlePopover).eventClick(eventClick);

      if (! dataHasName) {
        timeline.labelWidth(60);
      }

      element = d3.select(chart_placeholder).append('div').datum(data);
      if (timeline && timeline.constructor && timeline.call && timeline.apply) {
        timeline(element);
      }

      $('[data-toggle="popover"]').popover({
        'container': '#tl_div',
        'trigger': 'manual',
        'placement': 'top',
        'html': true,
      });

      $('#chart_placeholder').append('<div id="legend"></div>');

      $(window).on('resize', createTooltip);
    },
  };
})(ManageIQ);

function miqInitTimeline(json) {
  if (! json) {
    return;
  }

  var parsed = JSON.parse(json);

  var start;
  var end;
  if (! ManageIQ.calendar.calDateFrom || ! ManageIQ.calendar.calDateTo) {
    end = new Date();
    start = new Date(end - 24 * 60 * 60 * 1000 * 7);
  } else {
    start = new Date(ManageIQ.calendar.calDateFrom);
    end = new Date(ManageIQ.calendar.calDateTo);
  }

  ManageIQ.Timeline.load(parsed, start, end);
}
