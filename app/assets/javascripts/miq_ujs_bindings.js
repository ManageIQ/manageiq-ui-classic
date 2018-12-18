/* global miqCheckForChanges miqCheckMaxLength miqJqueryRequest miqMenuChangeRow miqSerializeForm miqSparkle miqSparkleOn miqObserveSetup */

// MIQ unobtrusive javascript bindings run when document is fully loaded

$(document).ready(function() {
  // Bind call to prompt if leaving an active edit
  $(document).on('ajax:beforeSend', 'a[data-miq_check_for_changes]', function() {
    return miqCheckForChanges();
  });

  $(document).on('click', 'button[data-click_url]', function() {
    var el = $(this);
    var parms = $.parseJSON(el.attr('data-click_url'));
    var url = parms.url;
    var options = {};
    if (el.attr('data-miq_sparkle_on')) {
      options.beforeSend = true;
    }
    if (el.attr('data-miq_sparkle_off')) {
      options.complete = true;
    }
    var submit = el.attr('data-submit');
    if (typeof submit !== 'undefined') {
      miqJqueryRequest(url, {data: miqSerializeForm(submit)});
    } else {
      miqJqueryRequest(url, options);
    }

    return false;
  });

  // bind button click to call JS function to send up grid data
  $(document).on('click', 'button[data-grid_submit]', function() {
    return miqMenuChangeRow($(this).attr('data-grid_submit'), $(this));
  });

  // Bind call to check/display text area max length on keyup
  $(document).on('keyup', 'textarea[data-miq_check_max_length]', function() {
    miqCheckMaxLength(this);
  });

  // Bind the MIQ spinning Q to configured links
  $(document).on('ajax:beforeSend', 'a[data-miq_sparkle_on]', function() {
    // Return only if data-miq_sparkle_on is set to false
    if ($(this).data('miq_sparkle_on') === false) {
      return;
    }

    // Call to miqSparkleOn since miqSparkle(true) checks XHR count, which is 0 before send
    miqSparkleOn();
  });
  $(document).on('ajax:complete', 'a[data-miq_sparkle_off]', function() {
    // Return only if data-miq_sparkle_off is set to false
    if ($(this).data('miq_sparkle_off') === false) {
      return;
    }

    miqSparkle(false);
  });

  // Handle data-submit - triggered by handleRemote from jquery-ujs
  $(document).on('ajax:before', 'a[data-submit]', function() {
    var form_id = $(this).data('submit');
    // because handleRemote will send the element's data-params as the POST body
    $(this).data('params', miqSerializeForm(form_id));
  });

  miqObserveSetup();

  // Run this last to be sure all other UJS bindings have been run in case the focus field is observed
  $('[data-miq_focus]').each(function(_index) {
    this.focus();
  });
});
