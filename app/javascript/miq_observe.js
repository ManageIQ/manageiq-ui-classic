/* global dialogFieldRefresh miqObserveRequest miqSerializeForm miqSendOneTrans */

const attemptAutoRefreshTrigger = (params) =>
  () => {
    if (params.auto_refresh === true) {
      dialogFieldRefresh.triggerAutoRefresh(params);
    }
  };

function miqSendDateRequest(el) {
  var parms = $.parseJSON(el.attr('data-miq_observe_date'));
  var url = parms.url;
  //  tack on the id and value to the URL
  var urlstring = url + '?' + el.prop('id') + '=' + el.val();

  var options = {
    beforeSend: !!el.attr('data-miq_sparkle_on'),
    complete: !!el.attr('data-miq_sparkle_off'),
    done: attemptAutoRefreshTrigger(parms),
  };

  return miqObserveRequest(urlstring, options);
}

export function setup() {
  // Bind in the observe support. If interval is configured, use the observe_field functi
n
  var observeWithInterval = function(el, parms) {
    if (el.data('isObserved')) {
      return;
    }
    el.data('isObserved', true);

    var interval = parms.interval;
    var url = parms.url;
    var submit = parms.submit;

    el.observe_field(interval, function() {
      var oneTrans = this.getAttribute('data-miq_send_one_trans'); // Grab one trans URL, if present
      if (typeof submit !== 'undefined') {
        // If submit element passed in
        miqObserveRequest(url, {
          data: miqSerializeForm(submit),
          done: attemptAutoRefreshTrigger(parms),
        });
      } else if (oneTrans) {
        miqSendOneTrans(url, {
          observe: true,
          done: attemptAutoRefreshTrigger(parms),
        });
      } else {
        // tack on the id and value to the URL
        var data = {};
        data[el.attr('id')] = el.prop('value');

        miqObserveRequest(url, {
          done: attemptAutoRefreshTrigger(parms),
          data: data,
        });
      }
    });
  };

  var observeOnChange = function(el, parms) {
    // No interval passed, use event observer
    el.off('change');
    el.on('change', _.debounce(function() {
      var id = el.attr('id');
      var value = el.prop('multiple') ? el.val() : encodeURIComponent(el.prop('value'));

      miqObserveRequest(parms.url, {
        no_encoding: true,
        data: id + '=' + value,
        beforeSend: !!el.attr('data-miq_sparkle_on'),
        complete: !!el.attr('data-miq_sparkle_off'),
        done: attemptAutoRefreshTrigger(parms),
      });
    }, 700, {leading: true, trailing: true}));
  };

  $(document).on('focus', '[data-miq_observe]', function() {
    var el = $(this);
    var parms = $.parseJSON(el.attr('data-miq_observe'));

    if (typeof parms.interval === 'undefined') {
      observeOnChange(el, parms);
    } else {
      observeWithInterval(el, parms);
    }
  });

  // Firefox on MacOs isn't firing onfocus events for radio buttons so onchange is used instead
  $(document).on('change', '[data-miq_observe]', function() {
    var el = $(this);
    var parms = $.parseJSON(el.attr('data-miq_observe'));
    var id = el.attr('id');
    var value = el.prop('multiple') ? el.val() : encodeURIComponent(el.prop('value'));

    miqObserveRequest(parms.url, {
      no_encoding: true,
      data: id + '=' + value,
      beforeSend: !!el.attr('data-miq_sparkle_on'),
      complete: !!el.attr('data-miq_sparkle_off'),
      done: attemptAutoRefreshTrigger(parms),
    });
  });

  $(document).on('change', '[data-miq_observe_checkbox]', function(event) {
    var el = $(this);
    var parms = $.parseJSON(el.attr('data-miq_observe_checkbox'));
    var url = parms.url;

    var id = el.attr('id');
    var value = encodeURIComponent(el.prop('checked') ? el.val() : 'null');

    miqObserveRequest(url, {
      no_encoding: true,
      data: id + '=' + value,
      beforeSend: !!el.attr('data-miq_sparkle_on'),
      complete: !!el.attr('data-miq_sparkle_off'),
      done: attemptAutoRefreshTrigger(parms),
    });

    event.stopPropagation();
  });

  ManageIQ.observeDate = function(el) {
    miqSendDateRequest(el);
  };

  $(document).on('changeDate clearDate', '[data-miq_observe_date]', function() {
    ManageIQ.observeDate($(this));
  });
}
