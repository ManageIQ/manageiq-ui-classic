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
      };

      miqObserveRequest(url, {
        done: attemptAutoRefreshTrigger(params),
        data,
      });
    }
  });
};

const elementValue = (element) => {
  if (element.prop('type') === 'checkbox' || element.attr('data-miq_observe_checkbox')) {
    return encodeURIComponent(element.prop('checked') ? element.val() : 'null');
  }

  if (element.prop('multiple')) {
    return element.val();
  }

  return encodeURIComponent(element.prop('value'));
};

const miqObserve = (element, params) => {
  const { url, interval } = params;
  if (interval) {
    // interval handled by observeWithInterval
    return;
  }

  const id = element.attr('id');
  const name = element.attr('name');
  const value = elementValue(element);

  if (id !== name) {
    console.warn(`miq_observe: element id and name differ: id=${id}, name=${name}, value=${value}`);
  }

  return miqObserveRequest(url, {
    no_encoding: true,
    data: `${id}=${value}`,
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
  const { url } = params;

  const id = element.prop('id');
  const value = element.val();

  return miqObserveRequest(`${url}?${id}=${value}`, {
    beforeSend: !!element.attr('data-miq_sparkle_on'),
    complete: !!element.attr('data-miq_sparkle_off'),
    done: attemptAutoRefreshTrigger(params),
  });
};


export function setup() {
  $(document).on('focus', '[data-miq_observe]', function() {
    const element = $(this);
    const params = $.parseJSON(element.attr('data-miq_observe'));

    if (params.interval) {
      observeWithInterval(element, params);
    }
  });

  $(document).on('change', '[data-miq_observe]', function() {
    const element = $(this);
    const params = $.parseJSON(element.attr('data-miq_observe'));

    debouncedObserve(element, params);
  });

  $(document).on('change', '[data-miq_observe_checkbox]', function(event) {
    const element = $(this);
    const params = $.parseJSON(element.attr('data-miq_observe_checkbox'));

    debouncedObserve(element, params);
    event.stopPropagation();
  });

  $(document).on('changeDate clearDate', '[data-miq_observe_date]', function() {
    const element = $(this);

    ManageIQ.observeDate(element);
  });
}
