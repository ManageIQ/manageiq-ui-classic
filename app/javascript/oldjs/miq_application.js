/* global add_flash getChartColumnDataValues getChartFormatedValue miqBrowserDetect miqExpressionPrefill miqFlashLater miqFlashSaved miqGridCheckAll miqGridGetCheckedRows miqMenu miqTreeObject miqValueStylePrefill recalculateChartYAxisLabels */

// MIQ specific JS functions

// Things to be done on page loads
window.miqOnLoad = function() {
  // controller to be used in url in miqDropComplete method
  ManageIQ.widget.dashboardUrl = 'dashboard/widget_dd_done';

  // Initialize the dashboard column sortables
  if (miqDomElementExists('col1')) {
    miqInitDashboardCols();
  }

  // Track the mouse coordinates for popup menus
  $(document).mousemove(function(e) {
    ManageIQ.mouse.x = e.pageX;
    ManageIQ.mouse.y = e.pageY;
  });

  miqBuildCalendar();

  // Initialize the dashboard widget pulldown
  if (miqDomElementExists('widget_select_div')) {
    miqInitWidgetPulldown();
  }

  // Refresh the myCodeMirror editor
  if (ManageIQ.editor !== null) {
    ManageIQ.editor.refresh();
  }

  // Run MIQ after onload code if present
  if (typeof ManageIQ.afterOnload === 'string') {
    eval(ManageIQ.afterOnload);
  }

  // Focus on search box, if it's there and allows focus
  if (miqDomElementExists('search_text')) {
    try {
      $('#search_text').focus();
    } catch (_e) {}
  }

  miqInitAccordions();
  miqInitMainContent();
  miqFlashSaved();
}

window.miqPrepRightCellForm = function(tree) {
  if (miqDomElementExists('adv_searchbox_div')) {
    $('#adv_searchbox_div').hide();
  }
  $('#toolbar').hide();
  miqTreeObject(tree).disableAll({silent: true, keepState: true});
  miqDimDiv(tree + '_div', true);
}

window.miqCalendarDateConversion = function(server_offset) {
  return moment().utcOffset(Number(server_offset) / 60).toDate();
};

// The expressions variable is used only in the following two functions
// TODO: Remove this scope wrapper after the expressions were moved to Ruby
(function() {
  // TODO: This probably should be moved into the Ruby code
  var expressions = {
    'boolean':     __('true/false'),
    'bytes':       __('Number (Bytes)'),
    'date':        __('Date'),
    'datetime':    __('Date/Time'),
    'decimal':     __('Integer'),
    'fixnum':      __('Integer'),
    'float':       __('Number'),
    'gigabytes':   __('Number (GB)'),
    'integer':     __('Integer'),
    'kbps':        __('KBps'),
    'kilobytes':   __('Number (kB)'),
    'megabytes':   __('Number (MB)'),
    'mhz':         __('MHz'),
    'mhz_avg':     __('MHz'),
    'numeric_set': __('Number List'),
    'percent':     __('Percent'),
    'regex':       __('Text (REGEX)'),
    'ruby':        __('Ruby Script'),
    'string':      __('Text'),
    'string_set':  __('String List'),
    'text':        __('Text'),
  };

  // Prefill expression value text entry fields when blank
  window.miqExpressionPrefill = function(expEditor, noPrefillCount) {
    var title;


    if ($('#chosen_value[type=text]').length) {
      $('#chosen_value').prop('placeholder', expressions[expEditor.first.type]);
      $('#chosen_value').prop('title', expEditor.first.title);
      $('#chosen_value').prop('alt', expEditor.first.title);
    }
    if ($('#chosen_cvalue[type=text]').length) {
      $('#chosen_cvalue').prop('placeholder', expressions[expEditor.second.type]);
      $('#chosen_cvalue').prop('title', expEditor.second.title);
      $('#chosen_cvalue').prop('alt', expEditor.second.title);
    }
    if ($('#chosen_regkey[type=text]').length) {
      title = __('Registry Key');
      $('#chosen_regkey').prop('placeholder', expressions.string);
      $('#chosen_regkey').prop('title', title);
      $('#chosen_regkey').prop('alt', title);
    }
    if ($('#chosen_regval[type=text]').length) {
      title = __('Registry Key Value');
      $('#chosen_regval').prop('placeholder', expressions.string);
      $('#chosen_regval').prop('title', title);
      $('#chosen_regval').prop('alt', title);
    }
    if ($('#miq_date_1_0[type=text]').length) {
      $('#miq_date_1_0').prop('placeholder', expressions[expEditor.first.type]);
      $('#miq_date_1_0').prop('title', expEditor.first.title);
      $('#miq_date_1_0').prop('alt', expEditor.first.title);
    }
    if ($('#miq_date_1_1[type=text]').length) {
      $('#miq_date_1_1').prop('placeholder', expressions[expEditor.first.type]);
      $('#miq_date_1_1').prop('title', expEditor.first.title);
      $('#miq_date_1_1').prop('alt', expEditor.first.title);
    }
    if ($('#miq_date_2_0[type=text]').length) {
      $('#miq_date_2_0').prop('placeholder', expressions[expEditor.second.type]);
      $('#miq_date_2_0').prop('title', expEditor.second.title);
      $('#miq_date_2_0').prop('alt', expEditor.second.title);
    }
    if ($('#miq_date_2_1[type=text]').length) {
      $('#miq_date_2_1').prop('placeholder', expressions[expEditor.second.type]);
      $('#miq_date_2_1').prop('title', expEditor.second.title);
      $('#miq_date_2_1').prop('alt', expEditor.second.title);
    }
    if (noPrefillCount) {
      expEditor.prefillCount = 0;
      setTimeout(function() {
        miqExpressionPrefill(expEditor, false);
      }, 200);
    } else {
      if (++expEditor.prefillCount > 100) {
        expEditor.prefillCount = 0;
      }
      setTimeout(function() {
        miqExpressionPrefill(expEditor, false);
      }, 200);
    }
  };

  // Prefill report editor style value text entry fields when blank
  // (written more generic for reuse, just have to build
  // the ManageIQ.reportEditor.valueStyles hash)
  window.miqValueStylePrefill = function(count) {
    var found = false;

    for (var field in ManageIQ.reportEditor.valueStyles) {
      if ($(field).length) {
        $(field).prop('placeholder', expressions[ManageIQ.reportEditor.valueStyles[field]]);
        found = true;
      }
    }
    if (found) {
      if (typeof count === 'undefined') {
        ManageIQ.reportEditor.prefillCount = 0;
        setTimeout(function() {
          miqValueStylePrefill(ManageIQ.reportEditor.prefillCount);
        }, 200);
      } else if (count === ManageIQ.reportEditor.prefillCount) {
        if (++ManageIQ.reportEditor.prefillCount > 100) {
          ManageIQ.reportEditor.prefillCount = 0;
        }
        setTimeout(function() {
          miqValueStylePrefill(ManageIQ.reportEditor.prefillCount);
        }, 200);
      }
    }
  };
})();

// Get user's time zone offset
window.miqGetTZO = function() {
  if (miqDomElementExists('user_TZO')) {
    $('#user_TZO').val(moment().utcOffset() / 60);
  }
}

// Get user's browswer info
window.miqGetBrowserInfo = function() {
  var bd = miqBrowserDetect();

  if (miqDomElementExists('browser_name')) {
    $('#browser_name').val(bd.browser);
  }
  if (miqDomElementExists('browser_version')) {
    $('#browser_version').val(bd.version);
  }
  if (miqDomElementExists('browser_os')) {
    $('#browser_os').val(bd.OS);
  }
}

// Turn highlight on or off
window.miqHighlight = function(elem, status) {
  if ($(elem).length) {
    return;
  }

  if (status) {
    $(elem).addClass('active');
  } else {
    $(elem).removeClass('active');
  }
}

// Turn on activity indicator
window.miqSparkle = function(status) {
  if (status) {
    // Make sure an ajax request is active before sparkling
    if ($.active) {
      miqSparkleOn();
    }
  } else if ($.active < 2) {
    // Make sure all but 1 ajax request is done
    miqSparkleOff();
  }
}

window.miqSparkleOn = function() {
  if (miqDomElementExists('advsearchModal') &&
      ($('#advsearchModal').hasClass('modal fade in'))) {
    if (miqDomElementExists('searching_spinner_center')) {
      miqSearchSpinner(true);
    }
    miqSpinner(false);
    if (miqDomElementExists('notification')) {
      $('#notification').hide();
    }
  } else {
    if (miqDomElementExists('notification')) {
      $('#notification').show();
    }
    miqSpinner(true);
  }
}

window.miqSparkleOff = function() {
  // this prevents ajax requests on GTL screens from disabling the spinner too early
  if (ManageIQ.gtl.loading) {
    return;
  }

  miqSpinner(false);
  if (miqDomElementExists('searching_spinner_center')) {
    miqSearchSpinner(false);
  }
  if (miqDomElementExists('notification')) {
    $('#notification').hide();
  }
  if (miqDomElementExists('rep_notification')) {
    $('#rep_notification').hide();
  }
}

// dim/un-dim a div: pass divname and status (true to dim, false to un-dim)
window.miqDimDiv = function(divname, status) {
  if ($(divname).length) {
    if (status) {
      $(divname).addClass('dimmed');
    } else {
      $(divname).removeClass('dimmed');
    }
  }
}

// Check for changes and prompt
window.miqCheckForChanges = function() {
  var type = 'old'; // 'old' | 'angular' | 'tagging' | 'react'
  var dirty = false;
  var ignore = miqDomElementExists('ignore_form_changes');

  if (ManageIQ.angular.scope && ManageIQ.angular.scope.angularForm) {
    type = 'angular';
  }

  if (ManageIQ.redux.store.getState().FormButtons && ManageIQ.redux.store.getState().FormButtons.in_a_form) {
    type = 'react';
  }

  // FIXME: this should not be a special case here, it should use the react reducer
  if (ManageIQ.redux.store.getState().tagging) {
    type = 'tagging';
  }

  switch (type) {
    case 'old':
      dirty = $('#buttons_on').is(':visible');
      break;

    case 'angular':
      dirty = ManageIQ.angular.scope.angularForm.$dirty;
      break;

    case 'react':
      dirty = ! ManageIQ.redux.store.getState().FormButtons.pristine;
      break;

    case 'tagging':
      var taggingStore = ManageIQ.redux.store.getState().tagging;
      dirty = ! _.isEqual(taggingStore.appState.assignedTags, taggingStore.initialState.assignedTags);
      break;
  }

  if (dirty && !ignore) {
    return confirm(__('Abandon changes?'));
  }

  // not in a form => abandon anything
  return true;
}

// Hide/show form buttons
window.miqButtons = function(h_or_s, prefix) {
  $('#flash_msg_div').hide();

  var on = h_or_s === 'show' ? 'on' : 'off';
  var off = h_or_s === 'show' ? 'off' : 'on';

  var buttonPrefix = (typeof prefix === 'undefined' || prefix === '') ? '' : (prefix + '_');

  $('#' + buttonPrefix + 'buttons_' + on).show();
  $('#' + buttonPrefix + 'buttons_' + off).hide();
}

// Hide/show form validate buttons
window.miqValidateButtons = function(h_or_s, prefix) {
  var buttonPrefix = prefix || '';
  var buttonsOnId = buttonPrefix + 'validate_buttons_on';
  var buttonsOffId = buttonPrefix + 'validate_buttons_off';

  $('#flash_msg_div').hide();

  if (h_or_s === 'show') {
    if (miqDomElementExists(buttonsOnId)) {
      $('#' + buttonsOnId).show();
    }
    if (miqDomElementExists(buttonsOffId)) {
      $('#' + buttonsOffId).hide();
    }
  } else {
    if (miqDomElementExists(buttonsOffId)) {
      $('#' + buttonsOffId).show();
    }
    if (miqDomElementExists(buttonsOnId)) {
      $('#' + buttonsOnId).hide();
    }
  }
}

// update all checkboxes on a form when the masterToggle checkbox is changed
// parms: button_div=<id of div with buttons to update>
window.miqUpdateAllCheckboxes = function(button_div) {
  if (!miqDomElementExists('masterToggle')) {
    return;
  }

  var state = $('#masterToggle').prop('checked');

  if (ManageIQ.grids.gtl_list_grid) {
    miqGridCheckAll(state);
    var crows = miqGridGetCheckedRows();

    ManageIQ.gridChecks = crows;
    miqSetButtons(crows.length, button_div);
  } else if ($('input.listcheckbox').length) {
    // No list_grid on the screen
    var cbs = $('input.listcheckbox')
      .prop('checked', state)
      .trigger('change');

    miqUpdateButtons(cbs[0], button_div);
  } else if ($("input[id^='storage_cb']").length) {
    // to handle check/uncheck all for C&U collection
    $("input[id^='storage_cb']")
      .prop('checked', state)
      .trigger('change');
    miqJqueryRequest(miqPassFields(
      '/configuration/form_field_changed',
      {storage_cb_all: state}
    ));
  }
}

// Update buttons based on number of checkboxes that are checked
// parms: obj=<checkbox element>, button_div=<id of div with buttons to update>
window.miqUpdateButtons = function(obj, button_div) {
  var count = 0;

  sendDataWithRx({rowSelect: obj});

  if (typeof obj.id !== 'undefined') {
    $("input[id^='check_']").each(function() {
      if (this.checked && !this.disabled) {
        count++;
      }
      if (count > 1) {
        return false;
      }
    });
  // Check for number object, as passed from snapshot tree
  } else if (typeof obj === 'number') {
    count = 1;
  }
  miqSetButtons(count, button_div);
}

window.miqSetToolbarCount = function(count) {
  sendDataWithRx({
    eventType: 'updateToolbarCount',
    countSelected: count,
  });
}

// Set the buttons in a div based on the count of checked items passed in
window.miqSetButtons = function(count, button_div) {
  if (button_div.match('_tb$') && count === 0) {
    // FIXME: this should be happening regardless of `count === 0`
    // ..but that needs more refactoring around miqUpdateAllCheckboxes, miqUpdateButtons, etc.
    miqSetToolbarCount(count);
    return;
  }

  if (miqDomElementExists(button_div) && button_div.match('_buttons$')) { // Handle buttons that are not part of miq toolbars
    if (count === 0) {
      $('#' + button_div + ' button[id$=on_1]').prop('disabled', true);
    } else {
      $('#' + button_div + ' button[id$=on_1]').prop('disabled', false);
    }
  }
}

// go to the specified URL when a table cell is clicked
window.DoNav = function(theUrl) {
  document.location.href = theUrl;
}

// Routines to get the size of the window
window.miqResetSizeTimer = function() {
  var height = window.innerHeight;
  var offset = 427;
  var h = height - offset;

  if (h < 200) {
    h = 200;
  }

  // Adjust certain elements, if present
  if (miqDomElementExists('list_grid')) {
    $('#list_grid').css({height: h + 'px'});
  } else if (miqDomElementExists('logview')) {
    $('#logview').css({height: h + 'px'});
  }
}

// Pass fields to server given a URL and fields in name/value pairs
window.miqPassFields = function (url, args) {
  return url + '?' + $.param(args);
};

window.miqChartLinkData = function(col, row, value, category, series, id, message) {
  // Create the context menu
  if (typeof miqMenu !== 'undefined') {
    miqMenu.hideContextMenu();
  }
  if (category.indexOf('<Other(') === 0) {
    // No menus for <Other> category
    return;
  }
  // Added delay before showing menus to get it work in version 3.5
  setTimeout(function() {
    miqBuildChartMenu(col, row, value, category, series, id, message);
  }, 250);
}

window.miqBuildChartMenu = function(col, row, _value, category, series, id, _message) {
  var set = id.split('_')[1]; // Get the chart set
  var idx = id.split('_')[2]; // Get the chart index
  var chart_data = ManageIQ.charts.chartData[set];
  var chart_el_id = id.replace(/^miq_/, 'miq_chart_');
  var chartmenu_el_id = id.replace(/^miq_/, 'miq_chartmenu_');

  if (chart_data[idx].menu != null && chart_data[idx].menu.length) {
    var rowcolidx = '_' + row + '-' + col + '-' + idx;

    for (var i = 0; i < chart_data[idx].menu.length; i++) {
      var menu_id = chart_data[idx].menu[i].split(':')[0] + rowcolidx;
      var pid = menu_id.split('-')[0];

      if ($('#' + chartmenu_el_id).find('#' + pid).length === 0) {
        $('#' + chartmenu_el_id).append("<li class='dropdown-submenu'>" +
          "<a tabindex='-1' href='#'>" + pid + '</a>' +
          "<ul id='' + pid + '' class='dropdown-menu'></ul></li>");
      }

      var menu_title = chart_data[idx].menu[i].split(':')[1];
      menu_title = menu_title.replace('<series>', series);
      menu_title = menu_title.replace('<category>', category);
      $('#' + pid).append("<li><a id='" + menu_id +
        "' href='#' onclick='miqChartMenuClick(this.id)'>" + menu_title + '</a></li>');
    }

    $('#' + chartmenu_el_id).css({'left': ManageIQ.mouse.x, 'top': ManageIQ.mouse.y});
    $('#' + chartmenu_el_id).dropdown('toggle');
    $('#' + chart_el_id).find('.overlay').show();
  }
}

window.miqChartBindEvents = function() {
  if (ManageIQ.charts.provider === 'c3') {
    // noop
  }
}

window.miqBuildChartMenuEx = function(col, row, _value, category, series, chart_set, chart_index) {
  var chart_data = ManageIQ.charts.chartData[chart_set];
  var chart_el = $('#miq_chart_parent_' + chart_set + '_' + chart_index);
  var chartmenu_el = $('#miq_chartmenu_' + chart_set + '_' + chart_index);
  chartmenu_el.empty();

  if (chart_data[chart_index].menu != null && chart_data[chart_index].menu.length) {
    var row_col_chart_index = {
      row: row,
      column: col,
      chart_index: chart_index,
    };
    for (var i = 0; i < chart_data[chart_index].menu.length; i++) {
      row_col_chart_index.chart_name = chart_data[chart_index].menu[i].split(':')[0];
      var pid = row_col_chart_index.chart_name.split('-')[0];
      if (chartmenu_el.find('#' + pid).length === 0) {
        chartmenu_el.append("<li class='dropdown-submenu'>" +
          "<a tabindex='-1' href='#'>" + pid + '</a>' +
          "<ul id='" + pid + "' class='dropdown-menu'></ul></li>");
      }

      var menu_title = chart_data[chart_index].menu[i].split(':')[1];
      menu_title = menu_title.replace('<series>', series);
      menu_title = menu_title.replace('<category>', category);
      $('#' + pid).append("<li><a id='" + btoa(JSON.stringify(row_col_chart_index)) + "' href='#' onclick='miqChartMenuClick(this.id)'>" + menu_title + '</a></li>');
    }

    // chart menu has min-width: 160 a has two levels
    var x_position = (ManageIQ.mouse.x > $(window).width() - 320) ? $(window).width() - 320 : ManageIQ.mouse.x;
    chartmenu_el.css({'left': x_position, 'top': ManageIQ.mouse.y});
    chartmenu_el.dropdown('toggle');
    chart_el.find('.overlay').show();
  }
}

// Handle chart context menu clicks
window.miqChartMenuClick = function(itemId) {
  if (miqDomElementExists('menu_div')) {
    $('#menu_div').hide();
  }
  if (itemId !== 'cancel') {
    miqAsyncAjax('?menu_click=' + itemId);
  }
}

window.miqRESTAjaxButton = function(url, button, dataType, data) {
  var form = $(button).parents('form:first')[0];
  if (form) {
    $(form).submit(function(e) {
      e.preventDefault();
      return false;
    });
    var formData;
    if (data) {
      formData = data;
    } else {
      formData = $(form).serialize();
    }
    return miqJqueryRequest(url, {
      beforeSend: true,
      complete: true,
      data: formData,
      dataType: dataType,
    });
  }

  miqAjaxButton(url, true);
}

// Handle an ajax form button press (i.e. Submit) by starting the spinning Q,
// then waiting for .7 seconds for observers to finish
window.miqAjaxButton = function(url, serialize_fields, options) {
  if (typeof serialize_fields === 'undefined') {
    serialize_fields = false;
  }
  if (miqDomElementExists('notification')) {
    $('#notification').show();
  }

  setTimeout(function() {
    miqAjaxButtonSend(url, serialize_fields, options);
  }, 700);
}

// Send ajax url after any outstanding ajax requests, wait longer if needed
window.miqAjaxButtonSend = function(url, serialize_fields, options) {
  if ($.active) {
    setTimeout(function() {
      miqAjaxButtonSend(url, serialize_fields, options);
    }, 700);
  } else {
    miqAjax(url, serialize_fields, options);
  }
}

// Function to generate an Ajax request
window.miqAjax = function(url, serialize_fields, options) {
  var data;

  if (serialize_fields === true) {
    data = miqSerializeForm('form_div');
  } else if (serialize_fields) {  // object or possibly FormData
    data = serialize_fields;
  }

  var defaultOptions = {
    beforeSend: true,
    complete: true,
  };

  // miqAjaxButton with { observeQueue: true } will queue the request instead of sending directly
  var requestFn = miqJqueryRequest;
  if (options && options.observeQueue) {
    delete options.observeQueue;
    requestFn = miqObserveRequest;
  }

  return requestFn(url, _.extend(defaultOptions, options || {}, { data: data }))
    .catch(function(err) {
      add_flash(__('Error requesting data from server'), 'error');
      console.log(err);
      return Promise.reject(err);
    });
}

// Function to generate an Ajax request for EVM async processing
window.miqAsyncAjax = function(url) {
  miqJqueryRequest(url, {beforeSend: true});
}

ManageIQ.oneTransition.oneTrans = 0;

// Function to generate an Ajax request, but only once for a drawn screen
window.miqSendOneTrans = function(url, observe) {
  if (ManageIQ.oneTransition.oneTrans) {
    return;
  }

  ManageIQ.oneTransition.oneTrans = 1;

  if (observe && observe.observe) {
    return miqObserveRequest(url, { done: observe.done });
  }
  return miqJqueryRequest(url);
}

// Check max length on a text area and set remaining chars
window.miqCheckMaxLength = function(obj) {
  var ml = obj.getAttribute ? parseInt(obj.getAttribute('maxlength'), 10) : '';
  var counter = obj.getAttribute ? obj.getAttribute('counter') : '';

  if (obj.getAttribute && obj.value.length > ml) {
    obj.value = obj.value.substring(0, ml);
  }
  if (counter) {
    $('#' + counter).text(obj.value.length);
  }
}

// Check for enter key pressed
window.miqEnterPressed = function(e) {
  var keycode;

  if (window.event) {
    keycode = window.event.keyCode;
  } else if (e) {
    keycode = e.which;
  } else {
    return false;
  }
  return (keycode === 13);
}

// Send login authentication via ajax
window.miqAjaxAuth = function(url) {
  miqEnableLoginFields(false);

  return miqJqueryRequest(url || '/dashboard/authenticate', {
    beforeSend: true,
    data: miqSerializeForm('login_div'),
  }).then(null, function(err) {
    // HTTP failures only, authentication failures come as 200, with their own javascript
    var message = __('Incorrect username or password');
    if (err && err.status && err.status !== 200 && err.statusText) {
      message = __('Login failed:') + ' ' + err.statusText;
    }

    clearFlash();
    add_flash(message, 'error', { id: 'auth_failed' });

    miqAjaxAuthFail();
    miqSparkleOff();
  });
}

window.miqAjaxAuthFail = function() {
  miqClearLoginFields();
  miqEnableLoginFields(true);
}

// Send SSO login authentication via ajax
window.miqAjaxAuthSso = function(url) {
  miqEnableLoginFields(false);
  miqSparkleOn();

  miqJqueryRequest(url || '/dashboard/kerberos_authenticate', {
    beforeSend: true,
  });
}

// Send External Authentication via ajax
window.miqAjaxExtAuth = function(url) {
  miqEnableLoginFields(false);
  miqSparkleOn();

  miqJqueryRequest(url || '/dashboard/external_authenticate', {
    beforeSend: true,
    data: miqSerializeForm('login_div'),
  });
}

window.miqEnableLoginFields = function(enabled) {
  $('#user_name').prop('readonly', !enabled);
  $('#user_password').prop('readonly', !enabled);
  if (miqDomElementExists('user_new_password')) {
    $('#user_new_password').prop('readonly', !enabled);
  }
  if (miqDomElementExists('user_verify_password')) {
    $('#user_verify_password').prop('readonly', !enabled);
  }
}

// reset form fields on login failure
window.miqClearLoginFields = function() {
  $('#user_name').val('').focus();
  $('#user_password').val('');
}

// Initialize dashboard column jQuery sortables
window.miqInitDashboardCols = function() {
  if (miqDomElementExists('col1')) {
    $('#col1').sortable({
      connectWith: '#col2, #col3',
      handle: '.sortable-handle',
      helper: 'clone',
      placeholder: 'sortable-placeholder',
      forcePlaceholderSize: true,
    });
    $('#col1').off('sortupdate');
    $('#col1').on('sortupdate', miqDropComplete);
  }
  if (miqDomElementExists('col2')) {
    $('#col2').sortable({
      connectWith: '#col1, #col3',
      handle: '.sortable-handle',
      helper: 'clone',
      placeholder: 'sortable-placeholder',
      forcePlaceholderSize: true,
    });
    $('#col2').off('sortupdate');
    $('#col2').on('sortupdate', miqDropComplete);
  }
  if (miqDomElementExists('col3')) {
    $('#col3').sortable({
      connectWith: '#col1, #col2',
      handle: '.sortable-handle',
      helper: 'clone',
      placeholder: 'sortable-placeholder',
      forcePlaceholderSize: true,
    });
    $('#col3').off('sortupdate');
    $('#col3').on('sortupdate', miqDropComplete);
  }
}

// Send the updated sortable order after jQuery drag/drop
window.miqDropComplete = function(_event, _ui) {
  var el = $(this);
  var url = '/' + ManageIQ.widget.dashboardUrl + '?' + el.sortable(
    'serialize', {key: el.attr('id') + '[]'}
  ).toString();
  // Adding id of record being edited to be used by load_edit call
  if (ManageIQ.record.recordId !== null) {
    url += '&id=' + ManageIQ.record.recordId;
  }
  miqJqueryRequest(url);
}

// Attach a calendar control to all text boxes that start with miq_date_
window.miqBuildCalendar = function() {
  // Get all of the input boxes with ids starting with "miq_date_"
  var all = $('input[id^=miq_date_]');

  all.each(function() {
    var element = $(this);
    var observeDateBackup = null;

    if (!element.data('datepicker')) {
      observeDateBackup = ManageIQ.observeDate;
      ManageIQ.observeDate = function() {};
      element.datepicker();
    }

    var startDate = element.attr('data_date_start');
    if (startDate) {
      element.datepicker('setStartDate', new Date(startDate));
    } else if (ManageIQ.calendar.calDateFrom) {
      element.datepicker('setStartDate', ManageIQ.calendar.calDateFrom);
    }

    if (ManageIQ.calendar.calDateTo) {
      element.datepicker('setEndDate', ManageIQ.calendar.calDateTo);
    }

    if (ManageIQ.calendar.calSkipDays) {
      element.datepicker('setDaysOfWeekDisabled', ManageIQ.calendar.calSkipDays);
    }

    if (observeDateBackup != null) {
      ManageIQ.observeDate = observeDateBackup;
    }
  });
}

window.miqSendDateRequest = function(el) {
  var parms = $.parseJSON(el.attr('data-miq_observe_date'));
  var url = parms.url;
  //  tack on the id and value to the URL
  var urlstring = url + '?' + el.prop('id') + '=' + el.val();

  var options = {
    beforeSend: !!el.attr('data-miq_sparkle_on'),
    complete: !!el.attr('data-miq_sparkle_off'),
  };

  return miqObserveRequest(urlstring, options);
}

// common function to pass ajax request to server
window.miqAjaxRequest = function(itemId, path) {
  if (miqCheckForChanges()) {
    miqJqueryRequest(
      miqPassFields(path, {id: itemId}),
      {beforeSend: true, complete: true});
    return true;
  }
  return false;
}

// Handle an element onclick to open href in a new window with optional confirmation
window.miqClickAndPop = function(el) {
  var conmsg = el.getAttribute('data-miq_confirm');

  if (conmsg == null || confirm(conmsg)) {
    window.open(el.href);
  }
  // no default browser reaction for onclick
  return false;
}

window.miq_tabs_init = function(id, url, parms) {
  $(id + ' > ul.nav-tabs a[data-toggle="tab"]').on('show.bs.tab', function(e) {
    if ($(e.target).parent().hasClass('disabled')) {
      e.preventDefault();
      return false;
    } else if (typeof url !== 'undefined') {
      // Load remote tab if an URL is specified
      var currTabTarget = $(e.target).attr('href').substring(1);
      var urlParams = _.reduce(parms || [], function(sum, value, key) {
        return sum + '&' + key + '=' + value;
      }, '?tab_id=' + currTabTarget);

      var editMode = typeof parms !== 'undefined' && parms['edit_mode'] !== 'undefined' && parms['edit_mode'] === 'true';
      if (editMode || miqCheckForChanges()) {
        miqObserveRequest(url + urlParams, {beforeSend: true})
          .catch(function (err) {
            add_flash(__('Error requesting data from server'), 'error');
            console.error(err);
            return Promise.reject(err);
          });
      } else {
        return false;
      }
    }
  });

  $(id + ' > ul.nav-tabs a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
    // Refresh CodeMirror when its tab is toggled
    if ($($(e.target).attr('href')).hasClass('cm-tab') && typeof ManageIQ.editor !== 'undefined') {
      miq_refresh_code_mirror();
    }
  });

  // If no active tab is present, set the first tab as active
  var active_tabs = $(id + ' > ul.nav-tabs li.active:not(.hidden)').length;
  var tab;
  if (active_tabs > 1) {
    tab = $(id + ' > ul.nav-tabs li:not(.hidden)').first().removeClass('active');
    $(tab.find('a').attr('href')).removeClass('active');
  } else if (active_tabs !== 1) {
    tab = $(id + ' > ul.nav-tabs li:not(.hidden)').first().addClass('active');
    $(tab.find('a').attr('href')).addClass('active');
  }

  // Hide the tab header when there is only one visible tab available
  if ($(id + ' > ul.nav-tabs > li:not(.hidden)').length === 1) {
    $(id + ' > ul.nav-tabs').hide();
  } else if ($(id + ' > ul.nav-tabs > li:not(.hidden)').length > 1) {
    $(id + ' > ul.nav-tabs').show();
  }
}

// refresh multiple/single code mirror textboxes on screen
window.miq_refresh_code_mirror = function() {
  $('.CodeMirror').each(function(_i, el) {
    el.CodeMirror.refresh();
  });
}

window.miq_tabs_disable_inactive = function(id) {
  $(id + ' ul.nav-tabs > li:not(.active)').addClass('disabled');
}

window.miq_tabs_show_hide = function(tab_id, show) {
  $(tab_id).toggleClass('hidden', !show);
}

// Send explorer search by name via ajax
window.miqSearchByName = function(button) {
  if (button == null) {
    miqJqueryRequest('x_search_by_name', {beforeSend: true, data: miqSerializeForm('searchbox')});
  }
}

// Send transaction to server so automate tree selection box can be made active
// and rest of the screen can be blocked
window.miqShowAE_Tree = function(typ) {
  var ae_url = '/' + ManageIQ.controller + '/ae_tree_select_toggle';
  miqJqueryRequest(miqPassFields(ae_url, {typ: typ}));
  return true;
}

// Toggle the user options div in the page header (:onclick from layouts/user_options)
window.miqChangeGroup = function(id) {
  miqSparkleOn();

  // prevent login redirect once current requests fail after the group gets changed
  ManageIQ.logoutInProgress = true;

  miqJqueryRequest(miqPassFields('/dashboard/change_group', {to_group: id}));
}

// Check for enter/escape on quick search box
window.miqQsEnterEscape = function(e) {
  var keycode;

  if (window.event) {
    keycode = window.event.keyCode;
  } else if (e) {
    keycode = e.keyCode;
  } else {
    return false;
  }

  if (keycode === 13) {
    if ($('#apply_button').is(':visible')) {
      miqAjaxButton('quick_search?button=apply');
      $('#quicksearchbox').modal('hide');
    }
  }

  if (keycode === 27) {
    miqAjaxButton('quick_search?button=cancel');
  }
}

// Start/stop the JS spinner
window.miqSpinner = function(status) {
  if (!miqSpinner.spinner) {
    miqSpinner.spinner = new Spinner({
      lines: 15, // The number of lines to draw
      length: 18, // The length of each line
      width: 4, // The line thickness
      radius: 25, // The radius of the inner circle
      color: '#fff', // #rgb or #rrggbb
      trail: 60, // Afterglow percentage
      className: 'miq-spinner', // The CSS class to assign to the spinner
    });
  }

  if (status) {
    var target = document.querySelector('#spinner_div');
    miqSpinner.spinner.spin(target);
  } else {
    miqSpinner.spinner.stop();
  }
}

// Start/stop the search spinner
window.miqSearchSpinner = function(status) {
  if (!miqSearchSpinner.spinner) {
    miqSearchSpinner.spinner = new Spinner({
      lines: 13, // The number of lines to draw
      length: 20, // The length of each line
      width: 10, // The line thickness
      radius: 30, // The radius of the inner circle
      color: '#000', // #rgb or #rrggbb or array of colors
      trail: 60, // Afterglow percentage
      className: 'miq-spinner', // The CSS class to assign to the spinner
    });
  }

  $('#search_notification').toggle(!!status);

  if (status) {
    var target = document.querySelector('#searching_spinner_center');
    miqSearchSpinner.spinner.spin(target);
  } else {
    miqSearchSpinner.spinner.stop();
  }
}

window.miqProcessObserveQueue = function() {
  if (!ManageIQ.observe.queue.length) {
    return;
  }

  if (ManageIQ.observe.processing) {
    setTimeout(miqProcessObserveQueue, 700);
    return;
  }

  ManageIQ.observe.processing = true;

  var request = ManageIQ.observe.queue.shift();

  miqJqueryRequest(request.url, request.options)
    .then(function(arg) {
      ManageIQ.observe.processing = false;
      request.deferred.resolve(arg);
    }, function(err) {
      ManageIQ.observe.processing = false;
      add_flash(__('Error requesting data from server'), 'error');
      console.log(err);
      request.deferred.reject(err);
    });
}

window.miqDeferred = function() {
  var deferred = {};

  deferred.promise = new Promise(function(resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}

window.miqObserveRequest = function(url, options) {
  options = _.cloneDeep(options || {});
  options.observe = true;

  var deferred = miqDeferred();

  ManageIQ.observe.queue.push({
    url: url,
    options: options,
    deferred: deferred,
  });

  miqProcessObserveQueue();

  return deferred.promise;
}

window.miqJqueryRequest = function(url, options) {
  if ((ManageIQ.observe.processing || ManageIQ.observe.queue.length) && (! options || ! options.observe)) {
    console.debug('Postponing miqJqueryRequest - waiting for the observe queue to empty first');

    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        miqJqueryRequest(url, options)
          .then(resolve, reject);
      }, 700);
    });
  }

  options = options || {};
  var ajax_options = {
    type: 'POST',
  };

  if (options.dataType === undefined) {
    ajax_options.accepts = {script: '*/*;q=0.5, ' + $.ajaxSettings.accepts.script};
    ajax_options.dataType = 'script';
  }

  // copy selected options over
  _.extend(ajax_options, _.pick(options, [
    'data',
    'dataType',
    'contentType',
    'processData',
    'cache',
  ]));

  if (options.beforeSend) {
    ajax_options.beforeSend = function(_request) {
      miqSparkle(true);
    };
  }

  var complete = [];
  if (options.complete) {
    complete.push(function(_request) {
      miqSparkle(false);
    });
  }

  if (options.done) {
    complete.push(options.done);
  }

  if (complete.length) {
    ajax_options.complete = complete;
  }

  return new Promise(function(resolve, reject) {
    $.ajax(options.no_encoding ? url : encodeURI(url), ajax_options)
      .then(resolve, reject);
  });
}

window.miqDomElementExists = function(element) {
  return $('#' + element).length;
}

window.miqSerializeForm = function(element) {
  return $('#' + element).find('input,select,textarea').serialize().replace(/%0D%0A/g, '%0A');
}

window.miqSerializeField = function(element, fieldName) {
  return $('#' + element + ' :input[id=' + fieldName + ']').serialize();
}

window.miqInitSelectPicker = function(selector, options) {
  $(selector || '.selectpicker').selectpicker(Object.assign({
    size: 10,
    dropupAuto: false,
    noneSelectedText: __('Nothing selected'),
  }, options || {}));
  $('.bootstrap-select > button[title]').not('.selectpicker').tooltip({container: 'none'});
}

window.miqInitCodemirror = function(options) {
  if (!miqDomElementExists(options.text_area_id)) {
    return;
  }

  var textarea = $('#' + options.text_area_id)[0];

  ManageIQ.editor = CodeMirror.fromTextArea(textarea, {
    mode: options.mode,
    lineNumbers: options.line_numbers,
    matchBrackets: true,
    theme: 'eclipse',
    readOnly: options.read_only ? 'nocursor' : false,
    inputStyle: "contenteditable",
    viewportMargin: Infinity,
  });

  ManageIQ.editor.on('change', function() {
    if (options.angular) {
      ManageIQ.editor.save();
      $(textarea).trigger('change');
    } else {
      miqSendOneTrans(options.url);
    }
  });

  ManageIQ.editor.on('blur', function() {
    ManageIQ.editor.save();
  });

  $('.CodeMirror').css('height', options.height);
  $('.CodeMirror').css('width', options.width);

  if (! options.no_focus && ! options.read_only) {
    ManageIQ.editor.focus();
  }
}

window.miqSelectPickerEvent = function(element, url, options) {
  options = options || {};
  options.no_encoding = true;
  var firstarg = !url.includes('?');

  $('#' + element).on('change', _.debounce(function() {
    var selected = $(this).val();
    var finalUrl = url + (firstarg ? '?' : '&') + element + '=' + encodeURIComponent(selected);

    if (typeof $(this).attr('data-miq_sparkle_on') !== 'undefined') {
      options.beforeSend = $(this).attr('data-miq_sparkle_on') === 'true';
    }

    if (typeof $(this).attr('data-miq_sparkle_off') !== 'undefined') {
      options.complete = $(this).attr('data-miq_sparkle_off') === 'true';
    }

    if (options.callback) {
      options.done = function() {
        options.callback();
      };
    }

    miqObserveRequest(finalUrl, options);

    return true;
  }, 700, {leading: true, trailing: true}));
}

window.miqAccordSelect = function(e) {
  if (ManageIQ.noCollapseEvent) { // implicitly return true when the noCollapseEvent is set
    return true;
  }
  if (!miqCheckForChanges()) {
    return false;
  }

  // No need to load anything if only a single accordion is present
  if ($('#accordion > .panel').length > 1) {
    var url = '/' + $('body').data('controller') + '/accordion_select?id=' + $(e.target).attr('id');
    miqJqueryRequest(url, {beforeSend: true, complete: true});
  }
  return true;
}

window.miqInitBootstrapSwitch = function(element, url, options) {
  $('[name=' + element + ']').bootstrapSwitch();

  $('#' + element).on('switchChange.bootstrapSwitch', function(_event, state) {
    options = typeof options !== 'undefined' ? options : {};
    options.no_encoding = true;

    var firstarg = !url.includes('?');
    miqObserveRequest(url + (firstarg ? '?' : '&') + element + '=' + state, options);

    return true;
  });
}

// Function to expand/collapse a pair of accordions
window.miqAccordionSwap = function(_collapse, expand) {
  /*
   * Blocked by: https://github.com/twbs/bootstrap/issues/18418
   * TODO: uncomment this and delete below when the issue is fixed
   *
   * // Fire an one-time event after the collapse is done
   * $(collapse).one('hidden.bs.collapse', function () {
   *   $(expand).collapse('show');
   * });
   * // Fire an one-time event fater the expand is done
   * $(expand).one('shown.bs.collapse', function () {
   *   ManageIQ.noCollapseEvent = false;
   * })
   * ManageIQ.noCollapseEvent = true;
   * $(collapse).collapse('hide');
   *
   */
  ManageIQ.noCollapseEvent = true;
  $(expand).parent().find('.panel-heading a').trigger('click');
  ManageIQ.noCollapseEvent = false;
}

window.miqInitAccordions = function() {
  var height = $('#left_div').height() - $('#toolbar').outerHeight() - $('#breadcrumbs').outerHeight();
  var panel = $('#left_div .panel-heading').outerHeight();
  var count = $('#accordion:visible > .panel .panel-body').length;
  $('#accordion:visible > .panel .panel-body').each(function(_k, v) {
    if (window.matchMedia('(max-width: 768px)').matches) {
      $(v).css('max-height', '');
      $(v).css('overflow-y', 'none');
    } else {
      $(v).css('max-height', (height - count * panel) + 'px');
      $(v).css('overflow-y', 'auto');
    }
    $(v).css('overflow-x', 'hidden');
  });
}

// Function to resize the main content for best fit between the toolbar & footer
window.miqInitMainContent = function() {
  var toolbar = $('#toolbar');
  var breadcrumbs = $('#breadcrumbs');
  var footer = $('#paging_div');
  var buttons = $('#form_buttons_div');
  var height = 0;
  if (footer.find('*:visible').length > 0) {
    height += footer.outerHeight();
  } else if (buttons.find('*:visible').length > 0) {
    height += buttons.outerHeight() + 5; // TODO: the styling of #form_buttons_div should be revisited
  }
  if (toolbar.find('*:visible').length > 0) {
    height += toolbar.outerHeight();
  }
  height += breadcrumbs.outerHeight();

  $('#main-content').css('height', 'calc(100% - ' + height + 'px)');
}

window.miqHideSearchClearButton = function(explorer) {
  // Hide the clear button if the search input is empty
  $('.search-pf .has-clear .clear').each(function() {
    if (!$(this).prev('.form-control').val()) {
      $(this).hide();
    }
  });
  // Show the clear button upon entering text in the search input
  $('.search-pf .has-clear .form-control').keyup(function() {
    var t = $(this);
    t.nextAll('button.clear').toggle(Boolean(t.val()));
  });
  // Upon clicking the clear button, empty the entered text and hide the clear button
  $('.search-pf .has-clear .clear').click(function() {
    $(this).prev('.form-control').val('').focus();
    $(this).hide();
    // Clear Search text values as well
    var url = '/' + ManageIQ.controller + '/search_clear' + '?in_explorer=' + explorer;
    miqJqueryRequest(url);
  });
}

window.toggle_expansion = function(link) {
  link = $(link);
  link.find('i').toggleClass('fa-angle-right fa-angle-down');
  link.closest('td').children(0).toggleClass('expanded');
}

window.check_for_ellipsis = function() {
  var $element = $('.expand');
  $.each($element, function(_i, value) {
    var $val = $(value);
    var $c = $val.clone().css('overflow', 'initial').appendTo('body');
    if ( $c.width() > $val.width() && $val.parent().find('i.fa-angle-right').length === 0) {
      add_expanding_icon($val.parent());
    }
    $c.remove();
  });
}

window.add_expanding_icon = function(element) {
  element.find('.pull-right').append("<a onclick='toggle_expansion(this)'> <i class='fa fa-angle-right'></i>");
}

window.rbacGroupLoadTab = function(id) {
  var lazy = $('#' + id).hasClass('lazy');
  if (!lazy) {
    // already loaded
    return;
  }

  $('#' + id).removeClass('lazy');

  miqJqueryRequest('/ops/rbac_group_load_tab?tab_id=' + id, {
    beforeSend: true,
    complete: true,
  });
}

window.chartData = function(type, data, data2) {
  if (type === undefined) {
    return emptyChart();
  }

  var config = _.cloneDeep(ManageIQ.charts.c3config[type]);
  if (config === undefined) {
    return emptyChart();
  }

  if (_.isObject(data.miq)) {
    if (data.miq.empty) {
      return _.defaultsDeep({}, data, data2);
    }
    customizeChart(data);
  }

  // set formating function for tooltip and y tick labels
  if (validateChartAxis(data.axis)) {
    var format = data.axis.y.tick.format;
    var titleFormat = _.cloneDeep(format);
    var max = _.max(getChartColumnDataValues(data.data.columns));
    var min = _.min(getChartColumnDataValues(data.data.columns));
    var maxShowed = getChartFormatedValue(format, max);
    var minShowed = getChartFormatedValue(format, min);
    var changeFormat = true;

    var tmp = validateMinMax(min, max, minShowed, maxShowed);
    changeFormat = !tmp.invalid;
    min = tmp.min;

    if (changeFormat) {
      // if min and max are close, labels should be more precise
      var recalculated = recalculatePrecision(minShowed, maxShowed, format, min, max);
      format = recalculated.format;
    }
    data.axis.y.tick.format = ManageIQ.charts.formatters[format.function].c3(format.options);
    data.miq.format = format;
    data.legend.item = {
      onclick: recalculateChartYAxisLabels,
    };

    data.tooltip.format.value = function(value, _ratio, _id) {
      var formatFunction = ManageIQ.charts.formatters[titleFormat.function].c3(titleFormat.options);
      return formatFunction(value);
    };
  }

  correctPatternflyOptions(config);
  return _.defaultsDeep({}, data, config, data2);
}

window.validateChartAxis = function(axis) {
  return _.isObject(axis) &&
         _.isObject(axis.y) &&
         _.isObject(axis.y.tick) &&
         _.isObject(axis.y.tick.format) &&
         axis.y.tick.format.function;
}

window.emptyChart = function() {
  return {
    data: {
      columns: [],
    },
  };
}

window.customizeChart = function(data) {
  // set maximum count of x axis tick labels for C&U charts
  if (data.miq.performance_chart) {
    data.axis.x.tick.centered = true;
    data.axis.x.tick.culling = { max: 5 };
  }

  // small C&U charts have very limited height
  if (data.miq.flat_chart) {
    var max = _.max(getChartColumnDataValues(data.data.columns));
    data.axis.y.tick.values = [0, max];
  }

  if (data.miq.expand_tooltip) {
    data.tooltip.format.name = function(_name, _ratio, id, _index) {
      return data.miq.name_table[id];
    };

    data.tooltip.format.title = function(x) {
      return data.miq.category_table[x];
    };
  }
  if (data.miq.zoomed) {
    data.size = { height: $('#lightbox-panel').height() - 200 };
    data.data.names = data.miq.name_table;
    data.legend = { position: 'bottom'};
  }
}

window.correctPatternflyOptions = function(config) {
  // some PatternFly default configs define contents function, but it breaks formatting
  if (_.isObject(config.tooltip)) {
    config.tooltip.contents = undefined;
  }
  // some PatternFly default configs define size of chart
  config.size = {};
}

$(function() {
  if (window.__testing__) {
    // in a jest test
    return;
  }

  $(window).on('resize', miqInitAccordions);
  $(window).on('resize', miqInitMainContent);
  $(window).on('resize', _.debounce(miqResetSizeTimer, 1000));

  check_for_ellipsis();
});

window.miqScrollToSelected = function(div_name) {
  var rowpos = $('tr.selected').position();
  if (rowpos) {
    $('#' + div_name).scrollTop(rowpos.top);
  }
}

window.miqFormatNotification = function(text, bindings) {
  if (!text) {
    // prevent Jed exceptions when a notification has missing text (__(undefined))
    return '';
  }

  var str = __(text);
  _.each(bindings, function(value, key) {
    str = str.replace(new RegExp('%{' + key + '}', 'g'), value.text);
  });
  return str;
}

window.fontIconChar = _.memoize(function(klass) {
  var tmp = document.createElement('i');
  tmp.className = 'hidden ' + klass;
  document.body.appendChild(tmp);
  var char = window.getComputedStyle(tmp, ':before').content.replace(/'|"/g, '');
  var font = window.getComputedStyle(tmp, ':before').fontFamily;
  tmp.remove();
  return {font: font, char: char};
});

window.redirectLogin = function(msg) {
  if (ManageIQ.logoutInProgress) {
    return; // prevent double redirect after pressing the Logout button or when changing group
  }

  add_flash(msg, 'warning');
  window.document.location.href = '/dashboard/login?timeout=true';
}

window.camelizeQuadicon = function(quad) {
  return _.reduce(quad, function(result, current, key) {
    var item = {};
    item[_.camelCase(key)] = current;
    return Object.assign(result, item);
  }, {});
}
