// add a flash message to an existing #flash_msg_div
// levels are error, warning, info, success
function add_flash(msg, level, options) {
  level = level || 'success';
  options = options || {};
  var cls = { alert: '', icon: '' };

  switch (level) {
    case 'error':
      cls.alert = 'alert alert-danger';
      cls.icon = 'pficon pficon-error-circle-o';
      break;
    case 'warn':  // miqFlash compatibility
    case 'warning':
      cls.alert = 'alert alert-warning';
      cls.icon = 'pficon pficon-warning-triangle-o';
      break;
    case 'info':
      cls.alert = 'alert alert-info';
      cls.icon = 'pficon pficon-info';
      break;
    case 'success':
      cls.alert = 'alert alert-success';
      cls.icon = 'pficon pficon-ok';
      break;
    default:
      throw ('add_flash: unknown level: ' + level);
  }

  if (options.long_alert) {
    cls.alert += ' text-overflow-pf';
  }

  var iconSpan = $('<span class="' + cls.icon + '"></span>');

  var textStrong = $('<strong></strong>');
  textStrong.text(msg);

  var alertDiv = $('<div class="' + cls.alert + '"><button class="close" data-dismiss="alert"><span class="pficon pficon-close"></span></button></div>');
  alertDiv.append(iconSpan, textStrong);

  // if options.long alert is given than add a `See More` button to the alert div to allow user the get more details of the error/alert.
  if (options.long_alert) {
    var detailsLinkTxt = __('View More');
    var detailsLink = $('<div class="alert_expand_link"><strong><a href="#">' + detailsLinkTxt + '</a></strong></div>');
    var params = {clicked: false, alert_elem: alertDiv, link: detailsLink};
    detailsLink.on('click', function() {
      expandAlert(params);
    });
    alertDiv.append(detailsLink);
  }

  var textDiv = $('<div class="flash_text_div"></div>');

  textDiv.append(alertDiv);

  // if options.id is provided, only one flash message with that id may exist
  if (options.id) {
    $('#' + options.id).filter('#flash_msg_div > *').remove();
    textDiv.attr('id', options.id);
  }

  $('#flash_msg_div').append(textDiv).show();

  // remove dangling 'Show More' link when the alert msg is short.
  if ( options.long_alert && ! checkElipsis(alertDiv) ) {
    detailsLink.hide();
  }
}

function clearFlash() {
  $('#flash_msg_div').empty();
}

function checkElipsis(element) {
  var found = false;
  var $c = element
    .clone()
    .css({display: 'inline-block', width: 'auto', visibility: 'hidden'})
    .appendTo('body');
  if ( $c.width() > element.width() ) {
    found = true;
  }

  $c.remove();

  return found;
}

function expandAlert(params) {
  var viewMoreTxt = __('View More');
  var viewLessTxt = __('View Less');
  if (! params.clicked) {
    params.clicked = true;
    params.alert_elem.removeClass('text-overflow-pf');
    params.alert_elem.addClass('text-vertical-overflow-pf');
    params.link.find('a').text(viewLessTxt);
  } else {
    params.clicked = false;
    params.alert_elem.removeClass('text-vertical-overflow-pf');
    params.alert_elem.addClass('text-overflow-pf');
    params.link.find('a').text(viewMoreTxt);
  }
}

function _miqFlashLoad() {
  return JSON.parse(sessionStorage.getItem('flash_msgs') || '[]');
}
function _miqFlashSave(arr) {
  return sessionStorage.setItem('flash_msgs', JSON.stringify(arr));
}

// stores a flash message (keys: message, level) for later
function miqFlashLater(object) {
  var ary = _miqFlashLoad();
  ary.push(object);
  _miqFlashSave(ary);
}

// shows all stored flash messages
function miqFlashSaved() {
  var ary = _miqFlashLoad();
  ary.forEach(function(obj) {
    add_flash(obj.message, obj.level);
  });

  miqFlashClearSaved();
}

// also called on login
function miqFlashClearSaved() {
  _miqFlashSave([]);
}
