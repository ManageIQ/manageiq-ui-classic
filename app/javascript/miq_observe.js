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

const miqObserve = (element, params) => {
  const { url, interval } = params;
  if (interval) {
    // interval handled by observeWithInterval
    return;
  }

  const id = element.attr('id');
  const value = element.prop('multiple') ? element.val() : encodeURIComponent(element.prop('value'));

  return miqObserveRequest(url, {
    no_encoding: true,
    data: id + '=' + value,
    beforeSend: !!element.attr('data-miq_sparkle_on'),
    complete: !!element.attr('data-miq_sparkle_off'),
    done: attemptAutoRefreshTrigger(params),
  });
};

const debouncedObserve = debounce(miqObserve, 700, {
  leading: true,
  trailing: true,
});

ManageIQ.observeDate = (element) => {
  const params = $.parseJSON(element.attr('data-miq_observe_date'));
  let { url } = params;

  //  tack on the id and value to the URL
  url += '?' + element.prop('id') + '=' + element.val();

  return miqObserveRequest(url, {
    beforeSend: !!element.attr('data-miq_sparkle_on'),
    complete: !!element.attr('data-miq_sparkle_off'),
    done: attemptAutoRefreshTrigger(params),
  });
};


export function setup() {
  $(document).on('focus', '[data-miq_observe]', function() {
    var el = $(this);
    var parms = $.parseJSON(el.attr('data-miq_observe'));

    if (typeof parms.interval === 'undefined') {
      // replaced by miqObserve
    } else {
      observeWithInterval(el, parms);
    }
  });

  $(document).on('change', '[data-miq_observe]', function() {
    const element = $(this);
    const params = $.parseJSON(element.attr('data-miq_observe'));

    debouncedObserve(element, params);
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

  $(document).on('changeDate clearDate', '[data-miq_observe_date]', function() {
    ManageIQ.observeDate($(this));
  });
}
