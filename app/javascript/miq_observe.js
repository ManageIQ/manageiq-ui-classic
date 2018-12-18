/* global dialogFieldRefresh miqObserveRequest miqSerializeForm miqSendOneTrans */

import { debounce } from 'lodash';

const attemptAutoRefreshTrigger = (params) =>
  () => {
    if (params.auto_refresh === true) {
      dialogFieldRefresh.triggerAutoRefresh(params);
    }
  };

const observeWithInterval = (element, params) => {
  const { interval, url, submit } = params;
  const id = element.attr('id');

  if (element.data('isObserved')) {
    return;
  }
  element.data('isObserved', true);

  element.observe_field(interval, function() {
    const oneTrans = this.getAttribute('data-miq_send_one_trans'); // Grab one trans URL, if present

    if (submit) {
      // If submit element passed in
      miqObserveRequest(url, {
        data: miqSerializeForm(submit),
        done: attemptAutoRefreshTrigger(params),
      });
    } else if (oneTrans) {
      miqSendOneTrans(url, {
        observe: true,
        done: attemptAutoRefreshTrigger(params),
      });
    } else {
      // tack on the id and value to the URL
      const data = {
        [id]: element.prop('value'),
      }

      miqObserveRequest(url, {
        done: attemptAutoRefreshTrigger(params),
        data: data,
      });
    }
  });
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
  var observeOnChange = function(el, parms) {
    // No interval passed, use event observer
    el.off('change');
    el.on('change', debounce(function() {
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
